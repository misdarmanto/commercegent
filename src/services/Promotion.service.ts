import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { sequelize } from '../models'
import { ProductModel } from '../models/products'
import { CategoryModel } from '../models/categories'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  IFindAllPromotionQuery,
  IRemovePromotionQuery,
  IUpdatePromotionBody
} from '../schemas/PromotionSchema'

export class PromotionService {
  static async findAllPromotions(query: IFindAllPromotionQuery) {
    try {
      const page = new Pagination(query.page, query.size)

      const result = await ProductModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          productIsHighlight: true,
          ...(Boolean(query.search) && {
            [Op.or]: [{ productName: { [Op.like]: `%${query.search}%` } }]
          }),
          ...(Boolean(query.productCategoryId) && {
            productCategoryId: { [Op.eq]: query.productCategoryId }
          }),
          ...(Boolean(query.productSubCategoryId) && {
            productSubCategoryId: { [Op.eq]: query.productSubCategoryId }
          })
        },
        include: [{ model: CategoryModel }],
        order: [['productId', 'desc']],
        ...(query.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PromotionService] findAllPromotions failed: ${String(error)}`)
      throw new AppError(
        'Gagal mengambil daftar promosi',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async updateHighlights(body: IUpdatePromotionBody) {
    const transaction = await sequelize.transaction()

    try {
      for (const item of body.products) {
        await ProductModel.update(
          { productIsHighlight: item.productIsHighlight },
          {
            where: { productId: item.productId },
            transaction
          }
        )
      }

      await transaction.commit()
      return { message: 'Product highlight updated successfully' as const }
    } catch (error) {
      await transaction.rollback()
      if (error instanceof AppError) throw error
      logger.error(`[PromotionService] updateHighlights failed: ${String(error)}`)
      throw new AppError(
        'Gagal memperbarui highlight produk',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async removeProductHighlight(query: IRemovePromotionQuery) {
    try {
      await ProductModel.update(
        { productIsHighlight: false },
        { where: { productId: query.productId } }
      )

      return { message: 'Product promotion removed successfully' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PromotionService] removeProductHighlight failed: ${String(error)}`)
      throw new AppError(
        'Gagal menghapus promosi produk',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
