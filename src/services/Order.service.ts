import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { OrdersModel, type OrdersAttributes } from '../models/OrderModel'
import { OrderItemsModel, type OrderItemsAttributes } from '../models/OrderItemModel'
import { ProductModel } from '../models/ProductModel'
import { AddressesModel } from '../models/AddressModel'
import { CartsModel } from '../models/CartModel'
import { UserModel } from '../models/UserModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  ICreateOrder,
  IFindAllOrder,
  IFindDetailOrder,
  IUpdateOrder
} from '../schemas/OrderSchema'
import { MidtransAPIService } from './external/Midtrans.service'
import { sequelizeInit } from '../configs/database'

type OrderLineItem = ICreateOrder['items'][number]

export class OrderService {
  private static buildFindAllWhere(
    userId: number,
    userRole: string | undefined,
    payload: IFindAllOrder
  ): WhereOptions<OrdersAttributes> {
    const where: WhereOptions<OrdersAttributes> = {
      deleted: { [Op.eq]: false }
    }

    if (payload.search != null) {
      where.orderReferenceId = { [Op.like]: `%${payload.search}%` }
    }
    if (userRole === 'user') {
      where.orderUserId = { [Op.eq]: userId }
    }
    if (payload.orderStatus != null) {
      where.orderStatus = payload.orderStatus as OrdersAttributes['orderStatus']
    }

    return where
  }

  static async findAllOrders(userId: number, payload: IFindAllOrder, userRole?: string) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await OrdersModel.findAndCountAll({
        where: this.buildFindAllWhere(userId, userRole, payload),
        include: [
          {
            model: UserModel,
            where: {
              deleted: { [Op.eq]: false },
              ...(Boolean(payload.search) && {
                [Op.or]: [{ userName: { [Op.like]: `%${payload.search}%` } }]
              })
            },
            attributes: ['userName']
          },
          {
            model: OrderItemsModel,
            as: 'orderItems',
            include: [
              {
                model: ProductModel
              }
            ]
          }
        ],
        order: [['orderId', 'desc']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[OrderService] findAllOrders failed: ${String(serviceError)}`)
      throw new AppError('Failed to find orders', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findDetailOrder(
    userId: number,
    userRole: string | undefined,
    payload: IFindDetailOrder
  ) {
    try {
      const result = await OrdersModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          orderId: { [Op.eq]: payload.orderId },
          ...(userRole === 'user' && {
            orderUserId: { [Op.eq]: userId }
          })
        },
        include: [
          {
            model: OrderItemsModel,
            as: 'orderItems',
            include: [
              {
                model: ProductModel
              }
            ]
          },
          {
            model: AddressesModel
          },
          {
            model: UserModel,
            where: {
              deleted: { [Op.eq]: false }
            },
            attributes: ['userName', 'userWhatsAppNumber', 'userCoin']
          }
        ]
      })

      if (result == null) {
        throw new AppError('Order not found', StatusCodes.NOT_FOUND)
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[OrderService] findDetailOrder failed: ${String(serviceError)}`)
      throw new AppError('Failed to find order', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createOrder(userId: number, payload: ICreateOrder) {
    const { items, orderShippingFee, orderCourierCompany, orderCourierType } = payload
    const productIds = items.map((i: OrderLineItem) => i.productId)

    const transaction = await sequelizeInit.transaction()

    try {
      const address = await AddressesModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          addressUserId: userId,
          addressCategory: 'user'
        },
        transaction: transaction
      })

      if (address == null) {
        throw new AppError('Shipping address not found', StatusCodes.NOT_FOUND)
      }

      const products = await ProductModel.findAll({
        where: {
          deleted: { [Op.eq]: false },
          productId: { [Op.in]: productIds }
        },
        transaction: transaction,
        lock: transaction.LOCK.UPDATE
      })

      if (products.length !== items.length) {
        throw new AppError('One of the products not found', StatusCodes.NOT_FOUND)
      }

      for (const item of items) {
        const product = products.find(
          (p) => String(p.productId) === String(item.productId)
        )
        if (product == null) continue
        if (product.productStock < item.quantity) {
          throw new AppError(
            `Stock product ${product.productName} is not enough`,
            StatusCodes.BAD_REQUEST
          )
        }
      }

      let orderSubtotal = 0
      let orderTotalItem = 0

      const orderItemsPayload = items.map((item: OrderLineItem) => {
        const product = products.find(
          (p) => String(p.productId) === String(item.productId)
        )!

        const quantity = item.quantity
        const price = Number(product.productSellPrice)
        const totalPrice = price * quantity

        orderSubtotal += totalPrice
        orderTotalItem += quantity

        return {
          productId: product.productId,
          productNameSnapshot: product.productName,
          productPriceSnapshot: price,
          productDiscountSnapshot: product.productDiscount,
          productSellPriceSnapshot: product.productSellPrice,
          quantity,
          totalPrice
        }
      })

      const orderPayload = {
        orderUserId: String(userId),
        orderSubtotal,
        orderShippingFee,
        orderGrandTotal: orderSubtotal + orderShippingFee,
        orderTotalItem,
        orderCourierCompany: orderCourierCompany ?? '',
        orderCourierType: orderCourierType ?? ''
      } as OrdersAttributes

      const order = await OrdersModel.create(orderPayload, { transaction: transaction })

      for (const item of orderItemsPayload) {
        const payload = {
          orderId: order.orderId,
          productId: item.productId,
          productNameSnapshot: item.productNameSnapshot,
          productPriceSnapshot: item.productPriceSnapshot,
          productDiscountSnapshot: item.productDiscountSnapshot,
          productSellPriceSnapshot: item.productSellPriceSnapshot,
          quantity: item.quantity,
          totalPrice: item.totalPrice
        } as OrderItemsAttributes

        await OrderItemsModel.create(payload, { transaction: transaction })
      }

      for (const item of orderItemsPayload) {
        await ProductModel.update(
          {
            productStock: sequelizeInit.literal(`product_stock - ${item.quantity}`),
            productTotalSale: sequelizeInit.literal(
              `product_total_sale + ${item.quantity}`
            )
          },
          {
            where: {
              productId: item.productId,
              deleted: { [Op.eq]: false }
            },
            transaction: transaction
          }
        )
      }

      const orderReferenceId = `ORDER-${order.orderId}-${Date.now()}`

      const midtransParams = {
        transaction_details: {
          order_id: orderReferenceId,
          gross_amount: order.orderGrandTotal
        },
        customer_details: {
          first_name: address.addressUserName,
          phone: address.addressKontak
        },
        item_details: [
          ...orderItemsPayload.map((item) => ({
            id: String(item.productId),
            price: item.productPriceSnapshot,
            discount: item.productDiscountSnapshot,
            sellPrice: item.productSellPriceSnapshot,
            quantity: item.quantity,
            name: item.productNameSnapshot
          })),
          {
            id: 'SHIPPING',
            price: orderShippingFee,
            quantity: 1,
            name: 'Shipping Fee'
          }
        ]
      }

      const midtransResponse = await MidtransAPIService.createTransaction(midtransParams)

      await order.update(
        {
          orderPaymentUrl: midtransResponse.redirect_url,
          orderPaymentToken: midtransResponse.token,
          orderReferenceId
        },
        { transaction: transaction }
      )

      await CartsModel.destroy({
        where: {
          deleted: { [Op.eq]: false },
          cartUserId: userId,
          cartProductId: { [Op.in]: productIds }
        },
        transaction: transaction
      })

      await transaction.commit()

      return {
        orderId: order.orderId,
        snapToken: midtransResponse.token,
        redirectUrl: midtransResponse.redirect_url
      }
    } catch (serviceError) {
      await transaction.rollback()
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[OrderService] createOrder failed: ${String(serviceError)}`)
      throw new AppError('Failed to create order', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateOrder(_userId: number, _payload: IUpdateOrder) {
    try {
      return { message: 'success' as const }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[OrderService] updateOrder failed: ${String(serviceError)}`)
      throw new AppError('Failed to update order', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
