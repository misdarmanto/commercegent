import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { sequelize } from '../models'
import { ProductAttributes, ProductModel } from '../models/products'
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
  private static buildFindAllWhere(
    payload: IFindAllPromotion
  ): WhereOptions<ProductAttributes> {
    const where: WhereOptions<ProductAttributes> = {
      deleted: { [Op.eq]: 0 },
      productIsHighlight: true
    }

    if (payload.search != null) {
      where.productName = { [Op.like]: `%${payload.search}%` }
    }

    if (payload.productCategoryId != null) {
      where.productCategoryId = { [Op.eq]: payload.productCategoryId }
    }

    if (payload.productSubCategoryId != null) {
      where.productSubCategoryId = { [Op.eq]: payload.productSubCategoryId }
    }

    return where
  }

  static async findAllPromotions(payload: IFindAllPromotion) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await ProductModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        include: [{ model: CategoryModel }],
        order: [['productId', 'desc']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
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
