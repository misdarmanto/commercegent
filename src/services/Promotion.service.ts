import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { sequelize } from '../models'
import { ProductModel } from '../models/products'
import { CategoryModel } from '../models/categories'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  IFindAllPromotion,
  IRemovePromotion,
  IUpdatePromotion
} from '../schemas/PromotionSchema'

export class PromotionService {
  static async findAllPromotions(payload: IFindAllPromotion) {
    try {
      const page = new Pagination(payload.page, payload.size)

      const result = await ProductModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          productIsHighlight: true,
          ...(Boolean(payload.search) && {
            [Op.or]: [{ productName: { [Op.like]: `%${payload.search}%` } }]
          }),
          ...(Boolean(payload.productCategoryId) && {
            productCategoryId: { [Op.eq]: payload.productCategoryId }
          }),
          ...(Boolean(payload.productSubCategoryId) && {
            productSubCategoryId: { [Op.eq]: payload.productSubCategoryId }
          })
        },
        include: [{ model: CategoryModel }],
        order: [['productId', 'desc']],
        ...(payload.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[PromotionService] findAllPromotions failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to find all promotions',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async updateHighlights(payload: IUpdatePromotion) {
    const transaction = await sequelize.transaction()

    try {
      for (const item of payload.products) {
        await ProductModel.update(
          { productIsHighlight: item.productIsHighlight },
          {
            where: { productId: item.productId },
            transaction
          }
        )
      }

      await transaction.commit()
    } catch (serviceError) {
      await transaction.rollback()
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[PromotionService] updateHighlights failed: ${String(serviceError)}`)
      throw new AppError('Failed to update highlights', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeProductHighlight(payload: IRemovePromotion) {
    try {
      await ProductModel.update(
        { productIsHighlight: false },
        { where: { productId: payload.productId } }
      )
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[PromotionService] removeProductHighlight failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to remove product highlights',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
