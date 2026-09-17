import { ChatToolsService } from './ChatTools.service'
import { CartService } from './Cart.service'
import { ProductModel } from '../models/ProductModel'
import { ProductVariantModel } from '../models/ProductVariantModel'

jest.mock('./Cart.service', () => ({
  CartService: { createCart: jest.fn(), findAllCarts: jest.fn() }
}))
jest.mock('../models/ProductModel', () => ({ ProductModel: { findOne: jest.fn() } }))
jest.mock('../models/ProductVariantModel', () => ({
  ProductVariantModel: { findOne: jest.fn() }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedProductFindOne = ProductModel.findOne as jest.Mock
const mockedVariantFindOne = ProductVariantModel.findOne as jest.Mock
const mockedCreateCart = CartService.createCart as jest.Mock
const mockedFindAllCarts = CartService.findAllCarts as jest.Mock

const buildToolCall = (name: string, args: Record<string, unknown>) => ({
  id: 'call_1',
  type: 'function' as const,
  function: { name, arguments: JSON.stringify(args) }
})

describe('ChatToolsService.addToCart', () => {
  it('returns a failure payload when the product does not exist', async () => {
    mockedProductFindOne.mockResolvedValue(null)

    const result = JSON.parse(
      await ChatToolsService.addToCart(1, { productId: 99, quantity: 1 })
    )

    expect(result).toEqual({ success: false, message: 'Produk tidak ditemukan.' })
    expect(mockedCreateCart).not.toHaveBeenCalled()
  })

  it('returns a failure payload when no variant is found', async () => {
    mockedProductFindOne.mockResolvedValue({ productId: 1, productName: 'Salmon' })
    mockedVariantFindOne.mockResolvedValue(null)

    const result = JSON.parse(
      await ChatToolsService.addToCart(1, { productId: 1, quantity: 1 })
    )

    expect(result.success).toBe(false)
    expect(mockedCreateCart).not.toHaveBeenCalled()
  })

  it('returns a failure payload when stock is insufficient', async () => {
    mockedProductFindOne.mockResolvedValue({ productId: 1, productName: 'Salmon' })
    mockedVariantFindOne.mockResolvedValue({
      productVariantId: 10,
      productVariantName: '500g',
      productVariantStock: 2
    })

    const result = JSON.parse(
      await ChatToolsService.addToCart(1, { productId: 1, quantity: 5 })
    )

    expect(result.success).toBe(false)
    expect(result.message).toContain('Stok tidak mencukupi')
    expect(mockedCreateCart).not.toHaveBeenCalled()
  })

  it('resolves the cheapest variant and adds it to the cart when no variant is specified', async () => {
    mockedProductFindOne.mockResolvedValue({ productId: 1, productName: 'Salmon' })
    mockedVariantFindOne.mockResolvedValue({
      productVariantId: 10,
      productVariantName: '500g',
      productVariantStock: 10
    })

    const result = JSON.parse(
      await ChatToolsService.addToCart(1, { productId: 1, quantity: 2 })
    )

    expect(mockedVariantFindOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { productVariantProductId: 1, deleted: false },
        order: [['productVariantSellPrice', 'asc']]
      })
    )
    expect(mockedCreateCart).toHaveBeenCalledWith(1, {
      cartProductId: 1,
      cartProductVariantId: 10,
      cartQuantity: 2
    })
    expect(result).toEqual({
      success: true,
      message: 'Salmon (500g) x2 berhasil ditambahkan ke keranjang.'
    })
  })

  it('looks up the specified variant when productVariantId is given', async () => {
    mockedProductFindOne.mockResolvedValue({ productId: 1, productName: 'Salmon' })
    mockedVariantFindOne.mockResolvedValue({
      productVariantId: 11,
      productVariantName: '1kg',
      productVariantStock: 10
    })

    await ChatToolsService.addToCart(1, { productId: 1, productVariantId: 11, quantity: 1 })

    expect(mockedVariantFindOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { productVariantId: 11, productVariantProductId: 1, deleted: false }
      })
    )
  })

  it('returns a failure payload when an unexpected error is thrown', async () => {
    mockedProductFindOne.mockRejectedValue(new Error('db down'))

    const result = JSON.parse(
      await ChatToolsService.addToCart(1, { productId: 1, quantity: 1 })
    )

    expect(result).toEqual({ success: false, message: 'Gagal menambahkan ke keranjang.' })
  })
})

describe('ChatToolsService.viewCart', () => {
  it('returns the cart contents on success', async () => {
    mockedFindAllCarts.mockResolvedValue({ totalItems: 1, items: [{ cartId: 1 }] })

    const result = JSON.parse(await ChatToolsService.viewCart(1))

    expect(result).toEqual({
      success: true,
      cart: { totalItems: 1, items: [{ cartId: 1 }] }
    })
  })

  it('returns a failure payload when the lookup throws', async () => {
    mockedFindAllCarts.mockRejectedValue(new Error('db down'))

    const result = JSON.parse(await ChatToolsService.viewCart(1))

    expect(result).toEqual({ success: false, message: 'Gagal mengambil isi keranjang.' })
  })
})

describe('ChatToolsService.execute', () => {
  it('dispatches add_to_cart calls to addToCart', async () => {
    mockedProductFindOne.mockResolvedValue({ productId: 1, productName: 'Salmon' })
    mockedVariantFindOne.mockResolvedValue({
      productVariantId: 10,
      productVariantName: '500g',
      productVariantStock: 10
    })

    const toolCall = buildToolCall('add_to_cart', { productId: 1, quantity: 2 })
    const result = JSON.parse(await ChatToolsService.execute(1, toolCall as any))

    expect(result.success).toBe(true)
    expect(mockedCreateCart).toHaveBeenCalled()
  })

  it('dispatches view_cart calls to viewCart', async () => {
    mockedFindAllCarts.mockResolvedValue({ totalItems: 0, items: [] })

    const toolCall = buildToolCall('view_cart', {})
    const result = JSON.parse(await ChatToolsService.execute(1, toolCall as any))

    expect(result).toEqual({ success: true, cart: { totalItems: 0, items: [] } })
  })

  it('returns a failure payload for an unknown tool name', async () => {
    const toolCall = buildToolCall('unknown_tool', {})
    const result = JSON.parse(await ChatToolsService.execute(1, toolCall as any))

    expect(result).toEqual({ success: false, message: 'Tool tidak dikenal.' })
  })

  it('returns a failure payload when the arguments are not valid JSON', async () => {
    const toolCall = {
      id: 'call_1',
      type: 'function' as const,
      function: { name: 'add_to_cart', arguments: '{not-json' }
    }

    const result = JSON.parse(await ChatToolsService.execute(1, toolCall as any))

    expect(result).toEqual({ success: false, message: 'Argumen tool tidak valid.' })
  })

  it('returns a success:false payload for non-function tool call types', async () => {
    const toolCall = { id: 'call_1', type: 'custom' as any }

    const result = JSON.parse(await ChatToolsService.execute(1, toolCall as any))

    expect(result).toEqual({ success: false })
  })
})
