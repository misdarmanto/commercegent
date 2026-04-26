import { Model, Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { sequelizeInit } from '../configs/database'
import { ProductAttributes, ProductModel } from '../models/ProductModel'
import { CategoryModel } from '../models/CategoryModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  IFindAllPromotion,
  IRemovePromotion,
  IUpdatePromotion
} from '../schemas/PromotionSchema'
import { ProductVariantModel } from '../models/ProductVariantModel'

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

  private static variantComparablePrice(variant: Record<string, unknown>): number {
    const sell = Number(variant.productVariantSellPrice)
    const base = Number(variant.productVariantPrice)
    if (!Number.isNaN(sell) && sell >= 0) return sell
    if (!Number.isNaN(base) && base >= 0) return base
    return Number.POSITIVE_INFINITY
  }

  private static mapProductRowToCheapestVariantObject(
    row: Model
  ): Record<string, unknown> {
    const plain = row.get({ plain: true }) as Record<string, unknown> & {
      variants?: Array<Record<string, unknown>>
    }
    const variants = plain.variants ?? []
    const { variants: _drop, ...rest } = plain
    const productIsHasVariant = variants.length > 1
    const productTotalStock = variants.reduce((total, variant) => {
      const variantStock = Number(variant.productVariantStock)
      return total + (Number.isNaN(variantStock) ? 0 : variantStock)
    }, 0)

    if (variants.length === 0) {
      return { ...rest, variant: null, productIsHasVariant: false, productTotalStock: 0 }
    }

    const variant = [...variants].sort(
      (a, b) => this.variantComparablePrice(a) - this.variantComparablePrice(b)
    )[0]

    return { ...rest, variant, productIsHasVariant, productTotalStock }
  }

  static async findAllPromotions(payload: IFindAllPromotion) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await ProductModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        order: [['productId', 'desc']],
        include: [
          {
            model: CategoryModel,
            attributes: [
              'categoryId',
              'categoryReference',
              'categoryName',
              'categoryIcon',
              'categoryType'
            ]
          },
          {
            model: ProductVariantModel,
            as: 'variants',
            attributes: [
              'productVariantId',
              'productVariantProductId',
              'productVariantName',
              'productVariantImage',
              'productVariantPrice',
              'productVariantSellPrice',
              'productVariantDiscount',
              'productVariantTotalSale',
              'productVariantStock',
              'productVariantWeight'
            ]
          }
        ],
        attributes: [
          'productId',
          'productName',
          'productDescription',
          'productCategoryId',
          'productSubCategoryId',
          'productCode',
          'productIsHighlight',
          'productIsVisible',
          'productBarcode',
          'productUnit'
        ],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      const rows = result.rows.map((row) =>
        this.mapProductRowToCheapestVariantObject(row)
      )

      return pager.formatData({ count: result.count, rows })
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
    const transaction = await sequelizeInit.transaction()

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
