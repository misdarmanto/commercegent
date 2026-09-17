import { ProductEmbeddingService } from './ProductEmbedding.service'
import { ProductModel } from '../models/ProductModel'
import { OpenAIService } from './external/OpenAI.service'
import { productPineconeIndex } from '../configs/pinecone'

jest.mock('../models/ProductModel', () => ({ ProductModel: { findOne: jest.fn() } }))
jest.mock('../models/ProductVariantModel', () => ({ ProductVariantModel: {} }))
jest.mock('../models/CategoryModel', () => ({ CategoryModel: {} }))
jest.mock('../configs/pinecone', () => ({
  productPineconeIndex: { upsert: jest.fn(), deleteOne: jest.fn(), query: jest.fn() }
}))
jest.mock('./external/OpenAI.service', () => ({
  OpenAIService: { createEmbedding: jest.fn() }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindOne = ProductModel.findOne as jest.Mock
const mockedCreateEmbedding = OpenAIService.createEmbedding as jest.Mock
const mockedUpsert = productPineconeIndex.upsert as jest.Mock
const mockedDeleteOne = productPineconeIndex.deleteOne as jest.Mock
const mockedQuery = productPineconeIndex.query as jest.Mock

const fakeProductRow = (plain: Record<string, unknown>) => ({ get: () => plain })

describe('ProductEmbeddingService.syncProduct', () => {
  it('removes the vector instead of upserting when the product no longer exists', async () => {
    mockedFindOne.mockResolvedValue(null)

    await ProductEmbeddingService.syncProduct(1)

    expect(mockedDeleteOne).toHaveBeenCalledWith({ id: 'product-1' })
    expect(mockedUpsert).not.toHaveBeenCalled()
  })

  it('removes the vector instead of upserting when the product is not visible', async () => {
    mockedFindOne.mockResolvedValue(
      fakeProductRow({
        productId: 1,
        productName: 'Hidden Product',
        productDescription: 'desc',
        productIsVisible: false,
        variants: []
      })
    )

    await ProductEmbeddingService.syncProduct(1)

    expect(mockedDeleteOne).toHaveBeenCalledWith({ id: 'product-1' })
    expect(mockedUpsert).not.toHaveBeenCalled()
  })

  it('embeds and upserts the product with computed price/stock metadata', async () => {
    mockedFindOne.mockResolvedValue(
      fakeProductRow({
        productId: 7,
        productName: 'Salmon',
        productDescription: 'Fresh salmon',
        productCategoryId: '3',
        productIsVisible: true,
        category: { categoryName: 'Meat & Fish' },
        variants: [
          {
            productVariantName: '500g',
            productVariantPrice: 70000,
            productVariantSellPrice: 65000,
            productVariantStock: 10,
            productVariantImage: 'img-500g.jpg'
          },
          {
            productVariantName: '1kg',
            productVariantPrice: 130000,
            productVariantSellPrice: 120000,
            productVariantStock: 5,
            productVariantImage: 'img-1kg.jpg'
          }
        ]
      })
    )
    mockedCreateEmbedding.mockResolvedValue([0.1, 0.2])

    await ProductEmbeddingService.syncProduct(7)

    expect(mockedCreateEmbedding).toHaveBeenCalledWith(expect.stringContaining('Salmon'))
    expect(mockedUpsert).toHaveBeenCalledWith({
      records: [
        expect.objectContaining({
          id: 'product-7',
          values: [0.1, 0.2],
          metadata: expect.objectContaining({
            productId: 7,
            productName: 'Salmon',
            productCategoryName: 'Meat & Fish',
            productPrice: 65000,
            productStock: 15
          })
        })
      ]
    })
  })
})

describe('ProductEmbeddingService.removeProduct', () => {
  it('deletes the vector by id', async () => {
    await ProductEmbeddingService.removeProduct(42)
    expect(mockedDeleteOne).toHaveBeenCalledWith({ id: 'product-42' })
  })

  it('swallows errors instead of throwing', async () => {
    mockedDeleteOne.mockRejectedValue(new Error('pinecone down'))
    await expect(ProductEmbeddingService.removeProduct(42)).resolves.toBeUndefined()
  })
})

describe('ProductEmbeddingService.searchProducts', () => {
  it('embeds the query and returns the matches from Pinecone', async () => {
    mockedCreateEmbedding.mockResolvedValue([0.5, 0.6])
    mockedQuery.mockResolvedValue({ matches: [{ id: 'product-1', metadata: {} }] })

    const result = await ProductEmbeddingService.searchProducts('salmon', 3)

    expect(mockedCreateEmbedding).toHaveBeenCalledWith('salmon')
    expect(mockedQuery).toHaveBeenCalledWith(
      expect.objectContaining({ vector: [0.5, 0.6], topK: 3, includeMetadata: true })
    )
    expect(result).toEqual([{ id: 'product-1', metadata: {} }])
  })

  it('returns an empty array when Pinecone has no matches', async () => {
    mockedCreateEmbedding.mockResolvedValue([0.5, 0.6])
    mockedQuery.mockResolvedValue({})

    const result = await ProductEmbeddingService.searchProducts('salmon')

    expect(result).toEqual([])
  })
})
