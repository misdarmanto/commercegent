import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { ProductAttributes, ProductModel } from '../models/products'
import { CategoryModel } from '../models/categories'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { calculateSellPrice } from '../utilities/priceCalculator'
import type {
  ICreateProduct,
  IFindAllProducts,
  IFindDetailProduct,
  IRemoveProduct,
  IUpdateProduct
} from '../schemas/ProductSchema'

export class ProductService {
  private static buildFindAllWhere(
    payload: IFindAllProducts,
    opts: { onlyVisible: boolean }
  ): WhereOptions<ProductAttributes> {
    const where: WhereOptions<ProductAttributes> = {
      deleted: { [Op.eq]: 0 }
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

  static async findAllProducts(payload: IFindAllProducts) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await ProductModel.findAndCountAll({
        where: this.buildFindAllWhere(payload, { onlyVisible: true }),
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
      logger.error(`[ProductService] findAllProducts failed: ${String(serviceError)}`)
      throw new AppError('Failed to find all products', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAllProductsAdmin(payload: IFindAllProducts) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await ProductModel.findAndCountAll({
        where: this.buildFindAllWhere(payload, { onlyVisible: false }),
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
          deleted: { [Op.eq]: 0 },
          productId: { [Op.eq]: payload.productId }
        },
        include: [{ model: CategoryModel }]
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

  static async createProduct(payload: ICreateProduct) {
    try {
      const existingProduct = await ProductModel.findOne({
        where: {
          deleted: 0,
          [Op.or]: [
            { productCode: payload.productCode },
            { productBarcode: payload.productBarcode }
          ]
        }
      })

      if (existingProduct != null) {
        let message = 'Product already registered'

        if (
          existingProduct.productCode === payload.productCode &&
          existingProduct.productBarcode === payload.productBarcode
        ) {
          message = 'Product code and barcode already registered'
        } else if (existingProduct.productCode === payload.productCode) {
          message = 'Product code already registered'
        } else if (existingProduct.productBarcode === payload.productBarcode) {
          message = 'Product barcode already registered'
        }

        throw new AppError(message, StatusCodes.BAD_REQUEST)
      }

      const productSellPrice = calculateSellPrice({
        originalPrice: Number(payload.productPrice),
        discountPercent: Number(payload.productDiscount)
      })

      await ProductModel.create({
        ...payload,
        productSellPrice,
        deleted: 0,
        productIsHighlight: false,
        productDescription: payload.productDescription ?? '',
        productCategoryId: String(payload.productCategoryId),
        productSubCategoryId: String(payload.productSubCategoryId),
        productBarcode: payload.productBarcode ?? '',
        productIsVisible: payload.productIsVisible ?? false
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ProductService] createProduct failed: ${String(serviceError)}`)
      throw new AppError('Failed to create product', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateProduct(payload: IUpdateProduct) {
    try {
      const product = await ProductModel.findOne({
        where: {
          deleted: 0,
          productId: payload.productId
        }
      })

      if (product == null) {
        throw new AppError('Product not found', StatusCodes.NOT_FOUND)
      }

      if (payload.productCode != null || payload.productBarcode != null) {
        const orConditions: Array<{ productCode?: string; productBarcode?: string }> = []

        if (payload.productCode != null) {
          orConditions.push({ productCode: payload.productCode })
        }

        if (payload.productBarcode != null) {
          orConditions.push({ productBarcode: payload.productBarcode })
        }

        const duplicateProduct = await ProductModel.findOne({
          where: {
            deleted: 0,
            productId: { [Op.ne]: payload.productId },
            [Op.or]: orConditions
          }
        })

        if (duplicateProduct != null) {
          let message = 'Product already registered'

          if (
            payload.productCode != null &&
            payload.productBarcode != null &&
            duplicateProduct.productCode === payload.productCode &&
            duplicateProduct.productBarcode === payload.productBarcode
          ) {
            message = 'Product code and barcode already registered'
          } else if (
            payload.productCode != null &&
            duplicateProduct.productCode === payload.productCode
          ) {
            message = 'Product code already registered'
          } else if (
            payload.productBarcode != null &&
            duplicateProduct.productBarcode === payload.productBarcode
          ) {
            message = 'Product barcode already registered'
          }

          throw new AppError(message, StatusCodes.BAD_REQUEST)
        }
      }

      const updatedPrice = payload.productPrice ?? product.productPrice
      const updatedDiscount = payload.productDiscount ?? product.productDiscount

      let productSellPrice: number | undefined
      if (payload.productPrice !== undefined || payload.productDiscount !== undefined) {
        productSellPrice = calculateSellPrice({
          originalPrice: Number(updatedPrice),
          discountPercent: Number(updatedDiscount)
        })
      }

      const {
        productCategoryId,
        productSubCategoryId,
        productId: _omitId,
        ...restUpdate
      } = payload

      if (
        Object.keys(restUpdate).length === 0 &&
        productCategoryId === undefined &&
        productSubCategoryId === undefined &&
        productSellPrice === undefined
      ) {
        throw new AppError('No fields to update', StatusCodes.BAD_REQUEST)
      }

      await product.update({
        ...restUpdate,
        ...(productSellPrice !== undefined && { productSellPrice }),
        ...(productCategoryId !== undefined && {
          productCategoryId: String(productCategoryId)
        }),
        ...(productSubCategoryId !== undefined && {
          productSubCategoryId: String(productSubCategoryId)
        })
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
        { deleted: 1 },
        {
          where: {
            deleted: { [Op.eq]: 0 },
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
