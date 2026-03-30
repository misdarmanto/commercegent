import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { sequelize } from '../models'
import { OrdersModel, type OrdersAttributes } from '../models/orders'
import { OrderItemsModel, type OrderItemsAttributes } from '../models/orderItems'
import { ProductModel } from '../models/products'
import { AddressesModel } from '../models/address'
import { CartsModel } from '../models/carts'
import { UserModel } from '../models/user'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { MidtransSnap } from '../configs/midtrans'
import type {
  ICreateOrderBody,
  IFindAllOrderQuery,
  IOrderDetailParams,
  IUpdateOrderBody
} from '../schemas/OrderSchema'

type OrderLineItem = ICreateOrderBody['items'][number]

export class OrderService {
  static async createOrder(userId: number, body: ICreateOrderBody) {
    const { items, orderShippingFee, orderCourierCompany, orderCourierType } = body
    const productIds = items.map((i: OrderLineItem) => i.productId)

    const t = await sequelize.transaction()

    try {
      const address = await AddressesModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          addressUserId: userId,
          addressCategory: 'user'
        },
        transaction: t
      })

      if (address == null) {
        await t.rollback()
        throw new AppError('alamat pengiriman tidak ditemukan', StatusCodes.NOT_FOUND)
      }

      const products = await ProductModel.findAll({
        where: {
          deleted: { [Op.eq]: 0 },
          productId: { [Op.in]: productIds }
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      })

      if (products.length !== items.length) {
        await t.rollback()
        throw new AppError('salah satu produk tidak ditemukan', StatusCodes.NOT_FOUND)
      }

      for (const item of items) {
        const product = products.find(
          (p) => String(p.productId) === String(item.productId)
        )
        if (product == null) continue
        if (product.productStock < item.quantity) {
          await t.rollback()
          throw new AppError(
            `Stock produk ${product.productName} tidak mencukupi`,
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

      const order = await OrdersModel.create(orderPayload, { transaction: t })

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

        await OrderItemsModel.create(payload, { transaction: t })
      }

      for (const item of orderItemsPayload) {
        await ProductModel.update(
          {
            productStock: sequelize.literal(`product_stock - ${item.quantity}`),
            productTotalSale: sequelize.literal(`product_total_sale + ${item.quantity}`)
          },
          {
            where: {
              productId: item.productId,
              deleted: { [Op.eq]: 0 }
            },
            transaction: t
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

      const midtransResponse = await MidtransSnap.createTransaction(midtransParams)

      await order.update(
        {
          orderPaymentUrl: midtransResponse.redirect_url,
          orderPaymentToken: midtransResponse.token,
          orderReferenceId
        },
        { transaction: t }
      )

      await CartsModel.destroy({
        where: {
          deleted: { [Op.eq]: 0 },
          cartUserId: userId,
          cartProductId: { [Op.in]: productIds }
        },
        transaction: t
      })

      await t.commit()

      return {
        orderId: order.orderId,
        snapToken: midtransResponse.token,
        redirectUrl: midtransResponse.redirect_url
      }
    } catch (error) {
      await t.rollback()
      if (error instanceof AppError) throw error
      logger.error(`[OrderService] createOrder failed: ${String(error)}`)
      throw new AppError('Gagal membuat pesanan', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAllOrders(userId: number, query: IFindAllOrderQuery) {
    try {
      const user = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userId
        }
      })

      const page = new Pagination(query.page, query.size)

      const result = await OrdersModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          ...(Boolean(query.search) && {
            [Op.or]: [{ orderReferenceId: { [Op.like]: `%${query.search}%` } }]
          }),
          ...(Boolean(user?.dataValues.userRole === 'user') && {
            orderUserId: { [Op.eq]: userId }
          }),
          ...(Boolean(query.orderStatus) && {
            orderStatus: { [Op.eq]: query.orderStatus }
          })
        },
        include: [
          {
            model: UserModel,
            where: {
              deleted: { [Op.eq]: 0 },
              ...(Boolean(query.search) && {
                [Op.or]: [{ userName: { [Op.like]: `%${query.search}%` } }]
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
        ...(query.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[OrderService] findAllOrders failed: ${String(error)}`)
      throw new AppError(
        'Gagal mengambil daftar pesanan',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findDetailOrder(params: IOrderDetailParams) {
    try {
      const result = await OrdersModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          orderId: { [Op.eq]: params.orderId }
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
              deleted: { [Op.eq]: 0 }
            },
            attributes: ['userName', 'userWhatsAppNumber', 'userCoin']
          }
        ]
      })

      if (result == null) {
        throw new AppError('Pesanan tidak ditemukan', StatusCodes.NOT_FOUND)
      }

      return result
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[OrderService] findDetailOrder failed: ${String(error)}`)
      throw new AppError(
        'Gagal mengambil detail pesanan',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async updateOrder(_userId: number, _body: IUpdateOrderBody) {
    try {
      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[OrderService] updateOrder failed: ${String(error)}`)
      throw new AppError('Gagal memperbarui pesanan', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
