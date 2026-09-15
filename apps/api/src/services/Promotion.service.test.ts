import { StatusCodes } from 'http-status-codes'
import { PromotionService } from './Promotion.service'
import { ProductModel } from '../models/ProductModel'
import { sequelizeInit } from '../configs/database'

jest.mock('../models/ProductModel', () => ({
  ProductModel: { findAndCountAll: jest.fn(), update: jest.fn() }
}))
jest.mock('../models/CategoryModel', () => ({ CategoryModel: {} }))
jest.mock('../models/ProductVariantModel', () => ({ ProductVariantModel: {} }))
jest.mock('../configs/database', () => ({
  sequelizeInit: { transaction: jest.fn() }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAndCountAll = ProductModel.findAndCountAll as jest.Mock
const mockedUpdate = ProductModel.update as jest.Mock
const mockedTransaction = sequelizeInit.transaction as jest.Mock

const fakeRow = (plain: Record<string, unknown>) => ({ get: () => plain })

describe('PromotionService.findAllPromotions', () => {
  it('picks the cheapest variant and computes total stock', async () => {
    mockedFindAndCountAll.mockResolvedValue({
      count: 1,
      rows: [
        fakeRow({
          productId: 1,
          variants: [
            { productVariantSellPrice: 20000, productVariantStock: 5 },
            { productVariantSellPrice: 15000, productVariantStock: 3 }
          ]
        })
      ]
    })

    const result = await PromotionService.findAllPromotions({ page: 1, size: 10 } as any)

    expect(result.items[0]).toMatchObject({
      productId: 1,
      productIsHasVariant: true,
      productTotalStock: 8,
      variant: { productVariantSellPrice: 15000, productVariantStock: 3 }
    })
  })

  it('returns a null variant and zero stock when there are no variants', async () => {
    mockedFindAndCountAll.mockResolvedValue({
      count: 1,
      rows: [fakeRow({ productId: 2, variants: [] })]
    })

    const result = await PromotionService.findAllPromotions({ page: 1, size: 10 } as any)

    expect(result.items[0]).toMatchObject({
      variant: null,
      productIsHasVariant: false,
      productTotalStock: 0
    })
  })
})

describe('PromotionService.updateHighlights', () => {
  it('commits the transaction after updating every product', async () => {
    const transaction = { commit: jest.fn(), rollback: jest.fn() }
    mockedTransaction.mockResolvedValue(transaction)

    await PromotionService.updateHighlights({
      products: [{ productId: 1, productIsHighlight: true }]
    } as any)

    expect(mockedUpdate).toHaveBeenCalledWith(
      { productIsHighlight: true },
      expect.objectContaining({ where: { productId: 1 }, transaction })
    )
    expect(transaction.commit).toHaveBeenCalled()
    expect(transaction.rollback).not.toHaveBeenCalled()
  })

  it('rolls back and wraps the error when an update fails', async () => {
    const transaction = { commit: jest.fn(), rollback: jest.fn() }
    mockedTransaction.mockResolvedValue(transaction)
    mockedUpdate.mockRejectedValue(new Error('db error'))

    await expect(
      PromotionService.updateHighlights({
        products: [{ productId: 1, productIsHighlight: true }]
      } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR })
    expect(transaction.rollback).toHaveBeenCalled()
    expect(transaction.commit).not.toHaveBeenCalled()
  })
})

describe('PromotionService.removeProductHighlight', () => {
  it('unsets the highlight flag for the product', async () => {
    mockedUpdate.mockResolvedValue([1])

    await PromotionService.removeProductHighlight({ productId: 1 } as any)

    expect(mockedUpdate).toHaveBeenCalledWith(
      { productIsHighlight: false },
      { where: { productId: 1 } }
    )
  })
})
