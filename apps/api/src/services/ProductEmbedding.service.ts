import { StatusCodes } from 'http-status-codes'
import { ProductModel } from '../models/ProductModel'
import { ProductVariantModel } from '../models/ProductVariantModel'
import { CategoryModel } from '../models/CategoryModel'
import { productPineconeIndex } from '../configs/pinecone'
import { OpenAIService } from './external/OpenAI.service'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'

const vectorId = (productId: number): string => `product-${productId}`

export class ProductEmbeddingService {
  private static buildEmbeddingText(product: {
    productName: string
    productDescription: string
    category?: { categoryName: string } | null
    variants?: Array<{ productVariantName: string }>
  }): string {
    const variantNames = (product.variants ?? [])
      .map((variant) => variant.productVariantName)
      .join(', ')

    return [
      `Nama produk: ${product.productName}`,
      product.category?.categoryName != null
        ? `Kategori: ${product.category.categoryName}`
        : null,
      variantNames.length > 0 ? `Varian: ${variantNames}` : null,
      `Deskripsi: ${product.productDescription}`
    ]
      .filter(Boolean)
      .join('\n')
  }

  static async syncProduct(productId: number): Promise<void> {
    try {
      const product = await ProductModel.findOne({
        where: { productId, deleted: false },
        include: [
          { model: CategoryModel, as: 'category', attributes: ['categoryName'] },
          {
            model: ProductVariantModel,
            as: 'variants',
            attributes: [
              'productVariantName',
              'productVariantPrice',
              'productVariantSellPrice',
              'productVariantStock',
              'productVariantImage'
            ]
          }
        ]
      })

      if (product == null) {
        await this.removeProduct(productId)
        return
      }

      const plain = product.get({ plain: true }) as any

      if (plain.productIsVisible !== true) {
        await this.removeProduct(productId)
        return
      }

      const embeddingText = this.buildEmbeddingText(plain)
      const embedding = await OpenAIService.createEmbedding(embeddingText)

      const variants = (plain.variants ?? []) as Array<Record<string, unknown>>
      const cheapestPrice = variants.reduce((min: number, variant) => {
        const price = Number(variant.productVariantSellPrice ?? variant.productVariantPrice)
        return Number.isFinite(price) && price < min ? price : min
      }, Number.POSITIVE_INFINITY)
      const totalStock = variants.reduce((total: number, variant) => {
        const stock = Number(variant.productVariantStock)
        return total + (Number.isFinite(stock) ? stock : 0)
      }, 0)

      await productPineconeIndex.upsert({
        records: [
          {
            id: vectorId(productId),
            values: embedding,
            metadata: {
              productId,
              productName: plain.productName,
              productCategoryId: plain.productCategoryId ?? '',
              productCategoryName: plain.category?.categoryName ?? '',
              productPrice: Number.isFinite(cheapestPrice) ? cheapestPrice : 0,
              productStock: totalStock,
              productImage: String(variants[0]?.productVariantImage ?? '')
            }
          }
        ]
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[ProductEmbeddingService] syncProduct failed: ${String(error)}`)
      throw new AppError(
        'Failed to sync product embedding',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async removeProduct(productId: number): Promise<void> {
    try {
      await productPineconeIndex.deleteOne({ id: vectorId(productId) })
    } catch (error) {
      logger.error(`[ProductEmbeddingService] removeProduct failed: ${String(error)}`)
    }
  }

  static async searchProducts(query: string, topK: number = 5) {
    try {
      const embedding = await OpenAIService.createEmbedding(query)

      const result = await productPineconeIndex.query({
        vector: embedding,
        topK,
        includeMetadata: true
      })

      return result.matches ?? []
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[ProductEmbeddingService] searchProducts failed: ${String(error)}`)
      throw new AppError('Failed to search products', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
