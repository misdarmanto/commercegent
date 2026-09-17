import type OpenAI from 'openai'
import { CartService } from './Cart.service'
import { ProductModel } from '../models/ProductModel'
import { ProductVariantModel } from '../models/ProductVariantModel'
import logger from '../utilities/logger'
import { AppError } from '../utilities/appError'

export const chatTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'add_to_cart',
      description:
        'Menambahkan produk ke keranjang belanja pelanggan. Gunakan productId dari daftar produk pada KONTEKS PRODUK. Jika pelanggan tidak menyebutkan varian, biarkan productVariantId kosong agar varian termurah dipilih otomatis.',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'number', description: 'ID produk yang ingin dibeli' },
          productVariantId: {
            type: 'number',
            description: 'ID varian produk yang dipilih (opsional)'
          },
          quantity: {
            type: 'number',
            description: 'Jumlah produk yang ingin ditambahkan, minimal 1'
          }
        },
        required: ['productId', 'quantity']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'view_cart',
      description: 'Menampilkan isi keranjang belanja pelanggan saat ini.',
      parameters: { type: 'object', properties: {} }
    }
  }
]

export class ChatToolsService {
  private static async resolveVariant(productId: number, productVariantId?: number) {
    if (productVariantId != null) {
      return ProductVariantModel.findOne({
        where: {
          productVariantId,
          productVariantProductId: productId,
          deleted: false
        }
      })
    }

    return ProductVariantModel.findOne({
      where: { productVariantProductId: productId, deleted: false },
      order: [['productVariantSellPrice', 'asc']]
    })
  }

  static async addToCart(
    userId: number,
    args: { productId: number; productVariantId?: number; quantity: number }
  ): Promise<string> {
    try {
      const product = await ProductModel.findOne({
        where: { productId: args.productId, deleted: false, productIsVisible: true }
      })

      if (product == null) {
        return JSON.stringify({ success: false, message: 'Produk tidak ditemukan.' })
      }

      const variant = await this.resolveVariant(args.productId, args.productVariantId)

      if (variant == null) {
        return JSON.stringify({
          success: false,
          message: 'Varian produk tidak ditemukan.'
        })
      }

      const quantity = Math.max(1, Math.floor(args.quantity))

      if ((variant.productVariantStock ?? 0) < quantity) {
        return JSON.stringify({
          success: false,
          message: `Stok tidak mencukupi. Stok tersedia: ${variant.productVariantStock ?? 0}.`
        })
      }

      await CartService.createCart(userId, {
        cartProductId: args.productId,
        cartProductVariantId: variant.productVariantId,
        cartQuantity: quantity
      })

      return JSON.stringify({
        success: true,
        message: `${product.productName} (${variant.productVariantName}) x${quantity} berhasil ditambahkan ke keranjang.`
      })
    } catch (error) {
      logger.error(`[ChatToolsService] addToCart failed: ${String(error)}`)
      const message = error instanceof AppError ? error.message : 'Gagal menambahkan ke keranjang.'
      return JSON.stringify({ success: false, message })
    }
  }

  static async viewCart(userId: number): Promise<string> {
    try {
      const carts = await CartService.findAllCarts(userId, {
        page: 1,
        size: 50,
        pagination: false
      } as any)

      return JSON.stringify({ success: true, cart: carts })
    } catch (error) {
      logger.error(`[ChatToolsService] viewCart failed: ${String(error)}`)
      return JSON.stringify({ success: false, message: 'Gagal mengambil isi keranjang.' })
    }
  }

  static async execute(
    userId: number,
    toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall
  ): Promise<string> {
    if (toolCall.type !== 'function') return JSON.stringify({ success: false })

    const { name, arguments: rawArgs } = toolCall.function
    let parsedArgs: Record<string, unknown> = {}

    try {
      parsedArgs = rawArgs.length > 0 ? JSON.parse(rawArgs) : {}
    } catch {
      return JSON.stringify({ success: false, message: 'Argumen tool tidak valid.' })
    }

    if (name === 'add_to_cart') {
      return this.addToCart(userId, {
        productId: Number(parsedArgs.productId),
        productVariantId:
          parsedArgs.productVariantId != null ? Number(parsedArgs.productVariantId) : undefined,
        quantity: Number(parsedArgs.quantity ?? 1)
      })
    }

    if (name === 'view_cart') {
      return this.viewCart(userId)
    }

    return JSON.stringify({ success: false, message: 'Tool tidak dikenal.' })
  }
}
