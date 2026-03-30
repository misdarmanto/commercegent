import { col, fn, Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { ProductModel } from '../models/products'
import { OrdersModel } from '../models/orders'
import { UserModel } from '../models/user'
import { OrderItemsModel } from '../models/orderItems'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { calculateSellPrice } from '../utilities/priceCalculator'
import type {
  ICreateProductPublicBody,
  IFindAllOrderPublicQuery,
  IUpdateProductPublicBody
} from '../schemas/PublicApiSchema'

export class PublicApiService {
  static async createProductPublic(body: ICreateProductPublicBody) {
    try {
      const orConditions: Array<{ productCode?: string; productBarcode?: string }> = []

      if (body.code) {
        orConditions.push({ productCode: body.code })
      }

      if (body.barcode) {
        orConditions.push({ productBarcode: body.barcode })
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
          body.code &&
          body.barcode &&
          duplicateProduct.productCode === body.code &&
          duplicateProduct.productBarcode === body.barcode
        ) {
          message = 'Product code dan barcode sudah terdaftar'
        } else if (body.code && duplicateProduct.productCode === body.code) {
          message = 'Product code sudah terdaftar'
        } else if (body.barcode && duplicateProduct.productBarcode === body.barcode) {
          message = 'Product barcode sudah terdaftar'
        }

        throw new AppError(message, StatusCodes.BAD_REQUEST)
      }

      const productSellPrice = calculateSellPrice({
        originalPrice: body.price,
        discountPercent: 0
      })

      await ProductModel.create({
        productName: body.name,
        productDescription: '',
        productImages: [],
        productPrice: body.price,
        productDiscount: 0,
        productStock: body.stock,
        productWeight: body.weight,
        productIsHighlight: false,
        productSellPrice,
        productIsVisible: body.isVisible,
        productCode: body.code,
        productBarcode: body.barcode,
        productUnit: body.unit,
        deleted: 0,
        productCategoryId: '0',
        productSubCategoryId: '0',
        productTotalSale: 0
      })

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PublicApiService] createProductPublic failed: ${String(error)}`)
      throw new AppError('Gagal membuat produk', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateProductPublic(body: IUpdateProductPublicBody) {
    try {
      const product = await ProductModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          productCode: body.code
        }
      })

      if (product == null) {
        throw new AppError(
          `Product with code (${body.code}) is not found`,
          StatusCodes.NOT_FOUND
        )
      }

      const productPayload: Record<string, unknown> = {}

      if (body.name !== undefined) {
        productPayload.productName = body.name
      }

      if (body.price !== undefined) {
        productPayload.productPrice = body.price
      }

      if (body.stock !== undefined) {
        productPayload.productStock = body.stock
      }

      if (body.weight !== undefined) {
        productPayload.productWeight = body.weight
      }

      if (body.barcode !== undefined) {
        productPayload.productBarcode = body.barcode
      }

      if (body.unit !== undefined) {
        productPayload.productUnit = body.unit
      }

      if (body.isVisible !== undefined) {
        productPayload.productIsVisible = body.isVisible
      }

      if (Object.keys(productPayload).length === 0) {
        throw new AppError('No data provided to update', StatusCodes.BAD_REQUEST)
      }

      await product.update(productPayload)

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PublicApiService] updateProductPublic failed: ${String(error)}`)
      throw new AppError('Gagal memperbarui produk', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAllOrdersPublic(query: IFindAllOrderPublicQuery) {
    try {
      const page = new Pagination(query.page, query.size)

      const dateFilter: Record<string, unknown> = {}

      if (query.startDate != null && query.endDate != null) {
        dateFilter.created_at = {
          [Op.between]: [`${query.startDate} 00:00:00`, `${query.endDate} 23:59:59`]
        }
      }

      const result = await OrdersModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          ...dateFilter,
          ...(Boolean(query.search) && {
            [Op.or]: [{ orderReferenceId: { [Op.like]: `%${query.search}%` } }]
          }),
          ...(Boolean(query.orderStatus) && {
            orderStatus: { [Op.eq]: query.orderStatus }
          })
        },
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
              ...(Boolean(query.search) && {
                [Op.or]: [{ userName: { [Op.like]: `%${query.search}%` } }]
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
        ...(query.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PublicApiService] findAllOrdersPublic failed: ${String(error)}`)
      throw new AppError(
        'Gagal mengambil daftar pesanan',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
