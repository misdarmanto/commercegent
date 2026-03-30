import fs from 'fs'
import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { ProductModel } from '../models/products'
import { CategoryModel } from '../models/categories'
import { FileUploadModel, type FileUploadAttributes } from '../models/fileUpload'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { calculateSellPrice } from '../utilities/priceCalculator'
import { addProductFileToQueue } from '../queues/productFileQueue'
import type {
  ICreateProductBody,
  IFindAllProductsQuery,
  IProductDetailParams,
  IRemoveProductQuery,
  IUpdateProductBody,
  IUploadHistoriesQuery
} from '../schemas/ProductSchema'

export class ProductService {
  static async findAllProducts(query: IFindAllProductsQuery) {
    try {
      const page = new Pagination(query.page, query.size)

      const result = await ProductModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          productIsVisible: { [Op.eq]: true },
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
      logger.error(`[ProductService] findAllProducts failed: ${String(error)}`)
      throw new AppError(
        'Gagal mengambil daftar produk',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findAllProductsAdmin(query: IFindAllProductsQuery) {
    try {
      const page = new Pagination(query.page, query.size)

      const result = await ProductModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
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
      logger.error(`[ProductService] findAllProductsAdmin failed: ${String(error)}`)
      throw new AppError(
        'Gagal mengambil daftar produk (admin)',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findDetailProduct(params: IProductDetailParams) {
    try {
      const result = await ProductModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          productId: { [Op.eq]: params.productId }
        },
        include: [{ model: CategoryModel }]
      })

      if (result == null) {
        throw new AppError('Produk tidak ditemukan', StatusCodes.NOT_FOUND)
      }

      return result
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[ProductService] findDetailProduct failed: ${String(error)}`)
      throw new AppError(
        'Gagal mengambil detail produk',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async createProduct(body: ICreateProductBody) {
    try {
      const existingProduct = await ProductModel.findOne({
        where: {
          deleted: 0,
          [Op.or]: [
            { productCode: body.productCode },
            { productBarcode: body.productBarcode }
          ]
        }
      })

      if (existingProduct != null) {
        let message = 'Product sudah terdaftar'

        if (
          existingProduct.productCode === body.productCode &&
          existingProduct.productBarcode === body.productBarcode
        ) {
          message = 'Product code dan barcode sudah terdaftar'
        } else if (existingProduct.productCode === body.productCode) {
          message = 'Product code sudah terdaftar'
        } else if (existingProduct.productBarcode === body.productBarcode) {
          message = 'Product barcode sudah terdaftar'
        }

        throw new AppError(message, StatusCodes.BAD_REQUEST)
      }

      const productSellPrice = calculateSellPrice({
        originalPrice: Number(body.productPrice),
        discountPercent: Number(body.productDiscount)
      })

      await ProductModel.create({
        ...body,
        productSellPrice,
        deleted: 0,
        productIsHighlight: false,
        productDescription: body.productDescription ?? '',
        productCategoryId: String(body.productCategoryId),
        productSubCategoryId: String(body.productSubCategoryId),
        productBarcode: body.productBarcode ?? '',
        productIsVisible: body.productIsVisible ?? false
      })

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[ProductService] createProduct failed: ${String(error)}`)
      throw new AppError('Gagal membuat produk', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateProduct(body: IUpdateProductBody) {
    try {
      const product = await ProductModel.findOne({
        where: {
          deleted: 0,
          productId: body.productId
        }
      })

      if (product == null) {
        throw new AppError('Product not found', StatusCodes.NOT_FOUND)
      }

      if (body.productCode != null || body.productBarcode != null) {
        const orConditions: Array<{ productCode?: string; productBarcode?: string }> = []

        if (body.productCode != null) {
          orConditions.push({ productCode: body.productCode })
        }

        if (body.productBarcode != null) {
          orConditions.push({ productBarcode: body.productBarcode })
        }

        const duplicateProduct = await ProductModel.findOne({
          where: {
            deleted: 0,
            productId: { [Op.ne]: body.productId },
            [Op.or]: orConditions
          }
        })

        if (duplicateProduct != null) {
          let message = 'Product sudah terdaftar'

          if (
            body.productCode != null &&
            body.productBarcode != null &&
            duplicateProduct.productCode === body.productCode &&
            duplicateProduct.productBarcode === body.productBarcode
          ) {
            message = 'Product code dan barcode sudah terdaftar'
          } else if (
            body.productCode != null &&
            duplicateProduct.productCode === body.productCode
          ) {
            message = 'Product code sudah terdaftar'
          } else if (
            body.productBarcode != null &&
            duplicateProduct.productBarcode === body.productBarcode
          ) {
            message = 'Product barcode sudah terdaftar'
          }

          throw new AppError(message, StatusCodes.BAD_REQUEST)
        }
      }

      const updatedPrice = body.productPrice ?? product.productPrice
      const updatedDiscount = body.productDiscount ?? product.productDiscount

      let productSellPrice: number | undefined
      if (body.productPrice !== undefined || body.productDiscount !== undefined) {
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
      } = body

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

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[ProductService] updateProduct failed: ${String(error)}`)
      throw new AppError('Gagal memperbarui produk', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeProduct(query: IRemoveProductQuery) {
    try {
      const result = await ProductModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          productId: { [Op.eq]: query.productId }
        }
      })

      if (result == null) {
        throw new AppError('Produk tidak ditemukan', StatusCodes.NOT_FOUND)
      }

      result.deleted = 1
      await result.save()

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[ProductService] removeProduct failed: ${String(error)}`)
      throw new AppError('Gagal menghapus produk', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async recordExcelUpload(file: { path: string; originalname: string }) {
    const payload = {
      fileName: file.originalname,
      filePath: file.path,
      status: 'PENDING'
    } as FileUploadAttributes

    try {
      const fileRecord = await FileUploadModel.create(payload)
      await addProductFileToQueue(fileRecord.fileId, file.path)

      return {
        fileId: fileRecord.fileId,
        fileName: fileRecord.fileName,
        status: fileRecord.status
      }
    } catch (error) {
      if (fs.existsSync(file.path)) {
        fs.unlink(file.path, () => {})
      }
      if (error instanceof AppError) throw error
      logger.error(`[ProductService] recordExcelUpload failed: ${String(error)}`)
      throw new AppError('Gagal memproses upload file', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findUploadHistories(query: IUploadHistoriesQuery) {
    try {
      const page = new Pagination(query.page, query.size)

      const result = await FileUploadModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          ...(Boolean(query.status) && {
            status: { [Op.eq]: query.status }
          })
        },
        order: [['fileId', 'desc']],
        ...(query.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[ProductService] findUploadHistories failed: ${String(error)}`)
      throw new AppError(
        'Gagal mengambil riwayat upload',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
