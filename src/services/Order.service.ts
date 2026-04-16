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
import { ProductVariantModel } from '../models/ProductVariantModel'

type OrderLineItem = ICreateOrder['items'][number]

export class OrderService {
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
    try {
      const { items, orderShippingFee, orderCourierCompany, orderCourierType } = payload

      const result = await sequelizeInit.transaction(async (transaction) => {
        const destinationAddress = await this.getMainUserAddressOrThrow(
          userId,
          transaction
        )

        const { quantityByVariantId, productIdsToClear, variantIds } =
          this.aggregateOrderItems(items)

        const productVariants = await this.getLockedVariantsOrThrow(
          variantIds,
          transaction
        )

        const variantById = this.indexVariantsById(productVariants)
        this.assertStockOrThrow(quantityByVariantId, variantById)

        const { orderItemsPayload, orderSubtotal, orderTotalItem } =
          this.buildOrderItemsPayload(items, variantById)

        const order = await this.createOrderAndItems(
          userId,
          {
            orderSubtotal,
            orderShippingFee,
            orderTotalItem,
            orderCourierCompany,
            orderCourierType
          },
          orderItemsPayload,
          transaction
        )

        await this.applyVariantStockMutation(quantityByVariantId, transaction)

        const orderReferenceId = `ORDER-${order.orderId}-${Date.now()}`

        const midtransResponse = await MidtransAPIService.createTransaction(
          this.buildMidtransParams({
            orderReferenceId,
            grossAmount: order.orderGrandTotal,
            customerName: destinationAddress.addressUserName,
            customerPhone: destinationAddress.addressKontak,
            orderShippingFee,
            orderItemsPayload
          })
        )

        await order.update(
          {
            orderPaymentUrl: midtransResponse.redirect_url,
            orderPaymentToken: midtransResponse.token,
            orderReferenceId
          },
          { transaction }
        )

        await this.clearCartItems(userId, productIdsToClear, transaction)

        return {
          orderId: order.orderId,
          snapToken: midtransResponse.token,
          redirectUrl: midtransResponse.redirect_url
        }
      })

      return result
    } catch (serviceError) {
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

  private static async getMainUserAddressOrThrow(userId: number, transaction: unknown) {
    const destinationAddress = await AddressesModel.findOne({
      where: {
        deleted: { [Op.eq]: false },
        addressUserId: userId,
        addressCategory: 'user',
        addressType: 'main'
      },
      transaction: transaction as any
    })

    if (destinationAddress == null) {
      throw new AppError('Destination address not found', StatusCodes.NOT_FOUND)
    }

    return destinationAddress
  }

  private static aggregateOrderItems(items: OrderLineItem[]) {
    const quantityByVariantId = new Map<number, number>()
    const productIdsToClear: number[] = []

    for (const item of items) {
      productIdsToClear.push(item.productId)
      const prev = quantityByVariantId.get(item.productVariantId) ?? 0
      quantityByVariantId.set(item.productVariantId, prev + item.quantity)
    }

    const variantIds = Array.from(quantityByVariantId.keys())
    return { quantityByVariantId, productIdsToClear, variantIds }
  }

  private static async getLockedVariantsOrThrow(
    variantIds: number[],
    transaction: any
  ): Promise<Array<(typeof ProductVariantModel)['prototype']>> {
    const productVariants = await ProductVariantModel.findAll({
      where: {
        deleted: { [Op.eq]: false },
        productVariantId: { [Op.in]: variantIds }
      },
      transaction,
      lock: transaction.LOCK.UPDATE
    })

    if (productVariants.length !== variantIds.length) {
      throw new AppError('One of the products variant not found', StatusCodes.NOT_FOUND)
    }

    return productVariants as any
  }

  private static indexVariantsById(productVariants: any[]) {
    const variantById = new Map<number, any>()
    for (const v of productVariants) {
      variantById.set(Number(v.productVariantId), v)
    }
    return variantById
  }

  private static assertStockOrThrow(
    quantityByVariantId: Map<number, number>,
    variantById: Map<number, any>
  ) {
    for (const [variantId, requestedQty] of quantityByVariantId.entries()) {
      const v = variantById.get(variantId)
      if (v == null) continue

      const stock = Number(v.productVariantStock ?? 0)
      if (stock < requestedQty) {
        throw new AppError(
          `Stock product variant ${v.productVariantName} is not enough`,
          StatusCodes.BAD_REQUEST
        )
      }
    }
  }

  private static buildOrderItemsPayload(
    items: OrderLineItem[],
    variantById: Map<number, any>
  ) {
    let orderSubtotal = 0
    let orderTotalItem = 0

    const orderItemsPayload = items.map((item: OrderLineItem) => {
      const v = variantById.get(item.productVariantId)
      if (v == null) {
        throw new AppError('One of the products variant not found', StatusCodes.NOT_FOUND)
      }

      const quantity = item.quantity
      const price = Number(v.productVariantSellPrice)
      const totalPrice = price * quantity

      orderSubtotal += totalPrice
      orderTotalItem += quantity

      return {
        productVariantId: Number(v.productVariantId),
        productVariantProductId: Number(v.productVariantProductId),
        productNameSnapshot: v.productVariantName,
        productPriceSnapshot: price,
        productDiscountSnapshot: v.productVariantDiscount,
        productSellPriceSnapshot: v.productVariantSellPrice,
        quantity,
        totalPrice
      }
    })

    return { orderItemsPayload, orderSubtotal, orderTotalItem }
  }

  private static async createOrderAndItems(
    userId: number,
    payload: {
      orderSubtotal: number
      orderShippingFee: number
      orderTotalItem: number
      orderCourierCompany?: string | null
      orderCourierType?: string | null
    },
    orderItemsPayload: Array<{
      productVariantProductId: number
      productNameSnapshot: string
      productPriceSnapshot: number
      productDiscountSnapshot: unknown
      productSellPriceSnapshot: unknown
      quantity: number
      totalPrice: number
    }>,
    transaction: any
  ) {
    const orderPayload: OrdersAttributes = {
      orderUserId: String(userId),
      orderSubtotal: payload.orderSubtotal,
      orderShippingFee: payload.orderShippingFee,
      orderGrandTotal: payload.orderSubtotal + payload.orderShippingFee,
      orderTotalItem: payload.orderTotalItem,
      orderCourierCompany: payload.orderCourierCompany ?? '',
      orderCourierType: payload.orderCourierType ?? ''
    } as OrdersAttributes

    const order = await OrdersModel.create(orderPayload, { transaction })

    const orderItemsRows: OrderItemsAttributes[] = orderItemsPayload.map((item) => ({
      orderId: order.orderId,
      productId: item.productVariantProductId,
      productNameSnapshot: item.productNameSnapshot,
      productPriceSnapshot: item.productPriceSnapshot,
      productDiscountSnapshot: item.productDiscountSnapshot as any,
      productSellPriceSnapshot: item.productSellPriceSnapshot as any,
      quantity: item.quantity,
      totalPrice: item.totalPrice
    })) as unknown as OrderItemsAttributes[]

    await OrderItemsModel.bulkCreate(orderItemsRows, { transaction })
    return order
  }

  private static async applyVariantStockMutation(
    quantityByVariantId: Map<number, number>,
    transaction: any
  ) {
    await Promise.all(
      Array.from(quantityByVariantId.entries()).map(([variantId, qty]) =>
        ProductVariantModel.update(
          {
            productVariantStock: sequelizeInit.literal(`product_variant_stock - ${qty}`),
            productVariantTotalSale: sequelizeInit.literal(
              `product_variant_total_sale + ${qty}`
            )
          },
          {
            where: {
              productVariantId: { [Op.eq]: variantId },
              deleted: { [Op.eq]: false }
            },
            transaction
          }
        )
      )
    )
  }

  private static buildMidtransParams(args: {
    orderReferenceId: string
    grossAmount: number
    customerName: string
    customerPhone: string
    orderShippingFee: number
    orderItemsPayload: Array<{
      productVariantProductId: number
      productNameSnapshot: string
      productPriceSnapshot: number
      productDiscountSnapshot: unknown
      productSellPriceSnapshot: unknown
      quantity: number
    }>
  }) {
    return {
      transaction_details: {
        order_id: args.orderReferenceId,
        gross_amount: args.grossAmount
      },
      customer_details: {
        first_name: args.customerName,
        phone: args.customerPhone
      },
      item_details: [
        ...args.orderItemsPayload.map((item) => ({
          id: String(item.productVariantProductId),
          price: item.productPriceSnapshot,
          discount: item.productDiscountSnapshot,
          sellPrice: item.productSellPriceSnapshot,
          quantity: item.quantity,
          name: item.productNameSnapshot
        })),
        {
          id: 'SHIPPING',
          price: args.orderShippingFee,
          quantity: 1,
          name: 'Shipping Fee'
        }
      ]
    }
  }

  private static async clearCartItems(
    userId: number,
    productIdsToClear: number[],
    transaction: any
  ) {
    await CartsModel.destroy({
      where: {
        deleted: { [Op.eq]: false },
        cartUserId: userId,
        cartProductId: { [Op.in]: productIdsToClear }
      },
      transaction
    })
  }

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
}
