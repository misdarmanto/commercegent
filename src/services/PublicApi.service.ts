import { col, fn, Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { ProductModel } from '../models/ProductModel'
import { OrdersModel, OrdersAttributes } from '../models/OrderModel'
import { UserModel } from '../models/UserModel'
import { OrderItemsModel } from '../models/OrderItemModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { calculateSellPrice } from '../utilities/priceCalculator'
import type {
  ICreateProductPublic,
  IFindAllOrderPublic,
  IUpdateProductPublic
} from '../schemas/PublicApiSchema'

export class PublicApiService {
  private static buildFindAllWhere(
    payload: IFindAllOrderPublic
  ): WhereOptions<OrdersAttributes> {
    const where: WhereOptions<OrdersAttributes> = {
      deleted: { [Op.eq]: 0 }
    }

    const dateFilter: Record<string, unknown> = {}

    if (payload.startDate != null && payload.endDate != null) {
      dateFilter.created_at = {
        [Op.between]: [`${payload.startDate} 00:00:00`, `${payload.endDate} 23:59:59`]
      }
    }

    if (payload.search != null) {
      where.orderReferenceId = { [Op.like]: `%${payload.search}%` }
    }

    if (payload.orderStatus != null) {
      where.orderStatus = { [Op.eq]: payload.orderStatus }
    }

    return where
  }

  static async findAllOrdersPublic(payload: IFindAllOrderPublic) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await OrdersModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        attributes: [
          'orderId',
          'orderSubtotal',
          'orderShippingFee',
          'orderGrandTotal',
          'orderTotalItem',
          'orderCourierCompany',
          'orderTrackingId',
          'orderWaybillId',
          'orderPaymentUrl',
          'orderReferenceId',
          'orderStatus',
          [fn('DATE', col('orders.created_at')), 'orderDate'],
          [fn('TIME', col('orders.created_at')), 'orderTime']
        ],
        include: [
          {
            model: UserModel,
            where: {
              deleted: { [Op.eq]: 0 },
              ...(Boolean(payload.search) && {
                [Op.or]: [{ userName: { [Op.like]: `%${payload.search}%` } }]
              })
            },
            attributes: ['userName', 'userWhatsAppNumber']
          },
          {
            model: OrderItemsModel,
            as: 'orderItems',
            attributes: [
              'productNameSnapshot',
              'productPriceSnapshot',
              'productDiscountSnapshot',
              'productSellPriceSnapshot',
              'quantity',
              'totalPrice'
            ],
            include: [
              {
                model: ProductModel,
                attributes: [
                  'productId',
                  'productName',
                  'productCode',
                  'productStock',
                  'productWeight',
                  'productIsVisible',
                  'productBarcode',
                  'productUnit'
                ]
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
      logger.error(
        `[PublicApiService] findAllOrdersPublic failed: ${String(serviceError)}`
      )
      throw new AppError('Failed to find all orders', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createProductPublic(payload: ICreateProductPublic) {
    try {
      const orConditions: Array<{ productCode?: string; productBarcode?: string }> = []

      if (payload.code) {
        orConditions.push({ productCode: payload.code })
      }

      if (payload.barcode) {
        orConditions.push({ productBarcode: payload.barcode })
      }

      const duplicateProduct = await ProductModel.findOne({
        where: {
          deleted: 0,
          [Op.or]: orConditions
        }
      })

      if (duplicateProduct != null) {
        let message = 'Product sudah terdaftar'

        if (
          payload.code &&
          payload.barcode &&
          duplicateProduct.productCode === payload.code &&
          duplicateProduct.productBarcode === payload.barcode
        ) {
          message = 'Product code dan barcode sudah terdaftar'
        } else if (payload.code && duplicateProduct.productCode === payload.code) {
          message = 'Product code sudah terdaftar'
        } else if (
          payload.barcode &&
          duplicateProduct.productBarcode === payload.barcode
        ) {
          message = 'Product barcode sudah terdaftar'
        }

        throw new AppError(message, StatusCodes.BAD_REQUEST)
      }

      const productSellPrice = calculateSellPrice({
        originalPrice: payload.price,
        discountPercent: 0
      })

      await ProductModel.create({
        productName: payload.name,
        productDescription: '',
        productImages: [],
        productPrice: payload.price,
        productDiscount: 0,
        productStock: payload.stock,
        productWeight: payload.weight,
        productIsHighlight: false,
        productSellPrice,
        productIsVisible: payload.isVisible,
        productCode: payload.code,
        productBarcode: payload.barcode,
        productUnit: payload.unit,
        deleted: 0,
        productCategoryId: '0',
        productSubCategoryId: '0',
        productTotalSale: 0
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[PublicApiService] createProductPublic failed: ${String(serviceError)}`
      )
      throw new AppError('Failed to create product', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateProductPublic(payload: IUpdateProductPublic) {
    try {
      const product = await ProductModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          productCode: payload.code
        }
      })

      if (product == null) {
        throw new AppError(
          `Product with code (${payload.code}) is not found`,
          StatusCodes.NOT_FOUND
        )
      }

      const productPayload: Record<string, unknown> = {}

      if (payload.name !== undefined) {
        productPayload.productName = payload.name
      }

      if (payload.price !== undefined) {
        productPayload.productPrice = payload.price
      }

      if (payload.stock !== undefined) {
        productPayload.productStock = payload.stock
      }

      if (payload.weight !== undefined) {
        productPayload.productWeight = payload.weight
      }

      if (payload.barcode !== undefined) {
        productPayload.productBarcode = payload.barcode
      }

      if (payload.unit !== undefined) {
        productPayload.productUnit = payload.unit
      }

      if (payload.isVisible !== undefined) {
        productPayload.productIsVisible = payload.isVisible
      }

      if (Object.keys(productPayload).length === 0) {
        throw new AppError(
          'No data provided to update product  ',
          StatusCodes.BAD_REQUEST
        )
      }

      await product.update(productPayload)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[PublicApiService] updateProductPublic failed: ${String(serviceError)}`
      )
      throw new AppError('Failed to update product', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
