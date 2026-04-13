import {
  Model,
  Op,
  UniqueConstraintError,
  type Transaction,
  type WhereOptions
} from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { ProductAttributes, ProductModel } from '../models/ProductModel'
import { CategoryModel } from '../models/CategoryModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { calculateSellPrice } from '../utilities/priceCalculator'
import { sequelizeInit } from '../configs/database'
import type {
  ICreateProduct,
  IFindAllProducts,
  IFindDetailProduct,
  IFindProductByBarcode,
  IRemoveProduct,
  IUpdateProduct
} from '../schemas/ProductSchema'
import { ProductVariantModel } from '../models/ProductVariantModel'
import type { ICreateProductVariant } from '../schemas/ProductVariantSchema'

export class ProductService {
  private static buildDuplicateProductWhere(payload: {
    productCode: string
    productBarcode?: string | null
  }): WhereOptions<ProductAttributes> {
    const or: Array<{ productCode?: string; productBarcode?: string }> = [
      { productCode: payload.productCode }
    ]
    const bc = payload.productBarcode
    if (bc != null && String(bc).trim() !== '') {
      or.push({ productBarcode: String(bc) })
    }
    return { [Op.or]: or }
  }

  private static async createProductVariants(
    productId: number,
    variants: ICreateProduct['productVariants'],
    transaction: Transaction
  ) {
    if (variants.length === 0) return

    await ProductVariantModel.bulkCreate(
      variants.map((variant) => ({
        ...variant,
        deleted: false,
        productVariantProductId: productId,
        productVariantSellPrice: calculateSellPrice({
          originalPrice: Number(variant.productVariantPrice),
          discountPercent: Number(variant.productVariantDiscount)
        })
      })),
      { transaction }
    )
  }

  private static async upsertProductVariants(
    productId: number,
    variants: IUpdateProduct['productVariants'],
    transaction: Transaction
  ) {
    if (variants.length === 0) return

    for (const variant of variants) {
      if ('productVariantId' in variant) {
        const existingVariant = await ProductVariantModel.findOne({
          where: {
            deleted: false,
            productVariantId: variant.productVariantId,
            productVariantProductId: productId
          },
          transaction
        })

        if (existingVariant == null) {
          throw new AppError(
            `Product variant ${variant.productVariantId} not found`,
            StatusCodes.NOT_FOUND
          )
        }

        const updatedPrice =
          variant.productVariantPrice ?? existingVariant.productVariantPrice
        const updatedDiscount =
          variant.productVariantDiscount ?? existingVariant.productVariantDiscount ?? 0

        await existingVariant.update(
          {
            ...variant,
            productVariantProductId: productId,
            ...(variant.productVariantPrice !== undefined ||
            variant.productVariantDiscount !== undefined
              ? {
                  productVariantSellPrice: calculateSellPrice({
                    originalPrice: Number(updatedPrice),
                    discountPercent: Number(updatedDiscount)
                  })
                }
              : {})
          },
          { transaction }
        )
        continue
      }

      const newVariant = variant as ICreateProductVariant
      await ProductVariantModel.create(
        {
          ...newVariant,
          deleted: false,
          productVariantProductId: productId,
          productVariantSellPrice: calculateSellPrice({
            originalPrice: Number(newVariant.productVariantPrice),
            discountPercent: Number(newVariant.productVariantDiscount)
          })
        },
        { transaction }
      )
    }
  }

  private static buildFindAllWhere(
    payload: IFindAllProducts,
    opts: { onlyVisible: boolean }
  ): WhereOptions<ProductAttributes> {
    const where: WhereOptions<ProductAttributes> = {
      deleted: { [Op.eq]: false }
    }

    if (opts.onlyVisible) {
      where.productIsVisible = { [Op.eq]: true }
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

    if (variants.length === 0) {
      return { ...rest, cheapestVariant: null }
    }

    const variant = [...variants].sort(
      (a, b) => this.variantComparablePrice(a) - this.variantComparablePrice(b)
    )[0]

    return { ...rest, variant }
  }

  static async findAllProducts(payload: IFindAllProducts) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await ProductModel.findAndCountAll({
        where: this.buildFindAllWhere(payload, { onlyVisible: true }),
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
              'productVariantWeight',
              'productVariantColor',
              'productVariantSize'
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
        order: [['productId', 'desc']],
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
      logger.error(`[ProductService] findAllProducts failed: ${String(serviceError)}`)
      throw new AppError('Failed to find all products', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAllProductsAdmin(payload: IFindAllProducts) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await ProductModel.findAndCountAll({
        where: this.buildFindAllWhere(payload, { onlyVisible: true }),
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
              'productVariantWeight',
              'productVariantColor',
              'productVariantSize'
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
        order: [['productId', 'desc']],
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
      logger.error(
        `[ProductService] findAllProductsAdmin failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to find all products (admin)',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findDetailProduct(payload: IFindDetailProduct) {
    try {
      const result = await ProductModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          productId: { [Op.eq]: payload.productId }
        },
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
              'productVariantWeight',
              'productVariantColor',
              'productVariantSize'
            ]
          }
        ]
      })

      if (result == null) {
        throw new AppError('Product not found', StatusCodes.NOT_FOUND)
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ProductService] findDetailProduct failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to find detail product',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findProductByBarcode(payload: IFindProductByBarcode) {
    try {
      const result = await ProductModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          productBarcode: { [Op.eq]: payload.barcode }
        }
      })

      if (result == null) {
        throw new AppError('Product not found', StatusCodes.NOT_FOUND)
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[ProductService] findProductByBarcode failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to find product by barcode',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async createProduct(payload: ICreateProduct) {
    try {
      await sequelizeInit.transaction(async (transaction) => {
        const existingProduct = await ProductModel.findOne({
          where: this.buildDuplicateProductWhere(payload),
          transaction
        })

        if (existingProduct != null) {
          let message = 'Product already registered'

          if (
            existingProduct.productCode === payload.productCode &&
            String(existingProduct.productBarcode ?? '') ===
              String(payload.productBarcode ?? '')
          ) {
            message = 'Product code and barcode already registered'
          } else if (existingProduct.productCode === payload.productCode) {
            message = 'Product code already registered'
          } else if (
            String(existingProduct.productBarcode ?? '') ===
            String(payload.productBarcode ?? '')
          ) {
            message = 'Product barcode already registered'
          }

          if (existingProduct.deleted === true) {
            message += ' (includes inactive / soft-deleted products)'
          }

          throw new AppError(message, StatusCodes.BAD_REQUEST)
        }

        const { productVariants, ...productFields } = payload

        const product = await ProductModel.create(
          {
            ...productFields,
            deleted: false,
            productIsHighlight: false,
            productDescription: payload.productDescription ?? '',
            productCategoryId: String(payload.productCategoryId),
            productSubCategoryId: String(payload.productSubCategoryId),
            productBarcode: payload.productBarcode ?? '',
            productIsVisible: payload.productIsVisible ?? false
          },
          { transaction }
        )

        await this.createProductVariants(product.productId, productVariants, transaction)
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      if (serviceError instanceof UniqueConstraintError) {
        const field = serviceError.errors[0]?.path ?? 'unknown'
        logger.warn(`[ProductService] createProduct unique constraint: ${String(field)}`)
        throw new AppError(
          `Duplicate value violates unique constraint (${String(field)})`,
          StatusCodes.CONFLICT
        )
      }
      logger.error(`[ProductService] createProduct failed: ${String(serviceError)}`)
      throw new AppError('Failed to create product', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateProduct(payload: IUpdateProduct) {
    try {
      await sequelizeInit.transaction(async (transaction) => {
        const product = await ProductModel.findOne({
          where: {
            deleted: false,
            productId: payload.productId
          },
          transaction
        })

        if (product == null) {
          throw new AppError('Product not found', StatusCodes.NOT_FOUND)
        }

        if (payload.productCode != null || payload.productBarcode != null) {
          const orConditions: Array<{ productCode?: string; productBarcode?: string }> =
            []

          if (payload.productCode != null) {
            orConditions.push({ productCode: payload.productCode })
          }

          const bc = payload.productBarcode
          if (bc != null && String(bc).trim() !== '') {
            orConditions.push({ productBarcode: String(bc) })
          }

          if (orConditions.length > 0) {
            const duplicateProduct = await ProductModel.findOne({
              where: {
                productId: { [Op.ne]: payload.productId },
                [Op.or]: orConditions
              },
              transaction
            })

            if (duplicateProduct != null) {
              let message = 'Product already registered'

              if (
                payload.productCode != null &&
                bc != null &&
                String(bc).trim() !== '' &&
                duplicateProduct.productCode === payload.productCode &&
                String(duplicateProduct.productBarcode ?? '') === String(bc)
              ) {
                message = 'Product code and barcode already registered'
              } else if (
                payload.productCode != null &&
                duplicateProduct.productCode === payload.productCode
              ) {
                message = 'Product code already registered'
              } else if (
                bc != null &&
                String(bc).trim() !== '' &&
                String(duplicateProduct.productBarcode ?? '') === String(bc)
              ) {
                message = 'Product barcode already registered'
              }

              if (duplicateProduct.deleted === true) {
                message += ' (includes inactive / soft-deleted products)'
              }

              throw new AppError(message, StatusCodes.BAD_REQUEST)
            }
          }
        }

        const {
          productCategoryId,
          productSubCategoryId,
          productVariants,
          productId: _omitId,
          ...restUpdate
        } = payload

        if (
          Object.keys(restUpdate).length === 0 &&
          productCategoryId === undefined &&
          productSubCategoryId === undefined &&
          productVariants.length === 0
        ) {
          throw new AppError('No fields to update', StatusCodes.BAD_REQUEST)
        }

        if (
          Object.keys(restUpdate).length > 0 ||
          productCategoryId !== undefined ||
          productSubCategoryId !== undefined
        ) {
          await product.update(
            {
              ...restUpdate,
              ...(productCategoryId !== undefined && {
                productCategoryId: String(productCategoryId)
              }),
              ...(productSubCategoryId !== undefined && {
                productSubCategoryId: String(productSubCategoryId)
              })
            },
            { transaction }
          )
        }

        await this.upsertProductVariants(product.productId, productVariants, transaction)
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ProductService] updateProduct failed: ${String(serviceError)}`)
      throw new AppError('Failed to update product', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeProduct(payload: IRemoveProduct) {
    try {
      const [updatedRows] = await ProductModel.update(
        { deleted: true },
        {
          where: {
            deleted: { [Op.eq]: false },
            productId: { [Op.eq]: payload.productId }
          }
        }
      )

      if (updatedRows === 0) {
        throw new AppError('Product not found', StatusCodes.NOT_FOUND)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ProductService] removeProduct failed: ${String(serviceError)}`)
      throw new AppError('Failed to remove product', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
