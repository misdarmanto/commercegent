import { UniqueConstraintError } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { ProductService } from './Product.service'
import { ProductModel } from '../models/ProductModel'
import { ProductVariantModel } from '../models/ProductVariantModel'
import { sequelizeInit } from '../configs/database'
import { calculateSellPrice } from '../utilities/priceCalculator'

jest.mock('../models/ProductModel', () => ({
  ProductModel: { findAndCountAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn() }
}))
jest.mock('../models/CategoryModel', () => ({ CategoryModel: {} }))
jest.mock('../models/ProductVariantModel', () => ({
  ProductVariantModel: {
    bulkCreate: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))
jest.mock('../configs/database', () => ({
  sequelizeInit: { transaction: jest.fn(async (cb: any) => await cb({})) }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))
jest.mock('../queues/productEmbeddingQueue', () => ({
  addProductEmbeddingToQueue: jest.fn()
}))

const mockedFindAndCountAll = ProductModel.findAndCountAll as jest.Mock
const mockedFindOne = ProductModel.findOne as jest.Mock
const mockedCreate = ProductModel.create as jest.Mock
const mockedUpdate = ProductModel.update as jest.Mock
const mockedVariantBulkCreate = ProductVariantModel.bulkCreate as jest.Mock
const mockedVariantFindOne = ProductVariantModel.findOne as jest.Mock
const mockedVariantCreate = ProductVariantModel.create as jest.Mock
const mockedVariantUpdate = ProductVariantModel.update as jest.Mock

const fakeRow = (plain: Record<string, unknown>) => ({ get: () => plain })

describe('ProductService.findAllProducts', () => {
  it('picks the cheapest variant per product', async () => {
    mockedFindAndCountAll.mockResolvedValue({
      count: 1,
      rows: [
        fakeRow({
          productId: 1,
          variants: [
            { productVariantSellPrice: 30000, productVariantStock: 2 },
            { productVariantSellPrice: 10000, productVariantStock: 4 }
          ]
        })
      ]
    })

    const result = await ProductService.findAllProducts({ page: 1, size: 10 } as any)

    expect(result.items[0]).toMatchObject({
      variant: { productVariantSellPrice: 10000, productVariantStock: 4 },
      productIsHasVariant: true,
      productTotalStock: 6
    })
  })
})

describe('ProductService.findAllProductsAdmin', () => {
  it('formats the paginated result', async () => {
    mockedFindAndCountAll.mockResolvedValue({
      count: 1,
      rows: [fakeRow({ productId: 1, variants: [] })]
    })

    const result = await ProductService.findAllProductsAdmin({ page: 1, size: 10 } as any)
    expect(result.totalItems).toBe(1)
  })
})

describe('ProductService.findDetailProduct', () => {
  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(
      ProductService.findDetailProduct({ productId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})

describe('ProductService.findProductByBarcode', () => {
  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(
      ProductService.findProductByBarcode({ barcode: '123' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})

describe('ProductService.createProduct', () => {
  const payload = {
    productName: 'Shoes',
    productCode: 'SHO-1',
    productBarcode: 'BC-1',
    productCategoryId: 1,
    productSubCategoryId: 2,
    productVariants: [
      { productVariantName: 'Red', productVariantPrice: 100000, productVariantDiscount: 10 }
    ]
  } as any

  it('rejects when both code and barcode are already registered', async () => {
    mockedFindOne.mockResolvedValue({
      productCode: 'SHO-1',
      productBarcode: 'BC-1',
      deleted: false
    })

    await expect(ProductService.createProduct(payload)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Product code and barcode already registered'
    })
  })

  it('mentions soft-deleted products in the duplicate message', async () => {
    mockedFindOne.mockResolvedValue({
      productCode: 'SHO-1',
      productBarcode: 'BC-1',
      deleted: true
    })

    await expect(ProductService.createProduct(payload)).rejects.toMatchObject({
      message: expect.stringContaining('soft-deleted')
    })
  })

  it('creates the product and its variants with a computed sell price', async () => {
    mockedFindOne.mockResolvedValue(null)
    mockedCreate.mockResolvedValue({ productId: 5 })

    await ProductService.createProduct(payload)

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ productName: 'Shoes', deleted: false, productIsHighlight: false }),
      expect.anything()
    )
    expect(mockedVariantBulkCreate).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          productVariantProductId: 5,
          productVariantSellPrice: calculateSellPrice({
            originalPrice: 100000,
            discountPercent: 10
          })
        })
      ],
      expect.anything()
    )
  })

  it('translates a UniqueConstraintError into a 409 AppError', async () => {
    mockedFindOne.mockResolvedValue(null)
    mockedCreate.mockRejectedValue(
      new UniqueConstraintError({ errors: [{ path: 'productCode' } as any] })
    )

    await expect(ProductService.createProduct(payload)).rejects.toMatchObject({
      statusCode: StatusCodes.CONFLICT
    })
  })
})

describe('ProductService.updateProduct', () => {
  it('throws a 404 AppError when the product does not exist', async () => {
    mockedFindOne.mockResolvedValue(null)

    await expect(
      ProductService.updateProduct({ productId: 1, productVariants: [] } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('throws a 400 AppError when there is nothing to update', async () => {
    mockedFindOne.mockResolvedValue({ productId: 1, update: jest.fn() })

    await expect(
      ProductService.updateProduct({ productId: 1, productVariants: [] } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })

  it('rejects a duplicate product code from another product', async () => {
    mockedFindOne
      .mockResolvedValueOnce({ productId: 1, update: jest.fn() })
      .mockResolvedValueOnce({ productId: 2, productCode: 'TAKEN', deleted: false })

    await expect(
      ProductService.updateProduct({
        productId: 1,
        productCode: 'TAKEN',
        productVariants: []
      } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })

  it('updates the product fields and upserts a new variant', async () => {
    const product = { productId: 1, update: jest.fn() }
    mockedFindOne.mockResolvedValue(product)

    await ProductService.updateProduct({
      productId: 1,
      productName: 'New name',
      productVariants: [
        { productVariantName: 'Blue', productVariantPrice: 50000, productVariantDiscount: 0 }
      ]
    } as any)

    expect(product.update).toHaveBeenCalledWith(
      expect.objectContaining({ productName: 'New name' }),
      expect.anything()
    )
    expect(mockedVariantCreate).toHaveBeenCalledWith(
      expect.objectContaining({ productVariantProductId: 1, productVariantName: 'Blue' }),
      expect.anything()
    )
  })

  it('throws a 404 AppError when updating a variant that does not belong to the product', async () => {
    mockedFindOne.mockResolvedValueOnce({ productId: 1, update: jest.fn() })
    mockedVariantFindOne.mockResolvedValueOnce(null)

    await expect(
      ProductService.updateProduct({
        productId: 1,
        productName: 'x',
        productVariants: [{ productVariantId: 99, productVariantPrice: 10000 }]
      } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('recomputes the sell price when updating an existing variant price', async () => {
    const existingVariant = {
      productVariantPrice: 100000,
      productVariantDiscount: 0,
      update: jest.fn()
    }
    mockedFindOne.mockResolvedValueOnce({ productId: 1, update: jest.fn() })
    mockedVariantFindOne.mockResolvedValueOnce(existingVariant)

    await ProductService.updateProduct({
      productId: 1,
      productVariants: [{ productVariantId: 1, productVariantDiscount: 20 }]
    } as any)

    expect(existingVariant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        productVariantSellPrice: calculateSellPrice({ originalPrice: 100000, discountPercent: 20 })
      }),
      expect.anything()
    )
  })
})

describe('ProductService.removeProduct', () => {
  it('throws a 404 AppError when no row matched', async () => {
    mockedUpdate.mockResolvedValue([0])
    await expect(ProductService.removeProduct({ productId: 1 } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
    expect(mockedVariantUpdate).not.toHaveBeenCalled()
  })

  it('soft-deletes the product and its variants', async () => {
    mockedUpdate.mockResolvedValue([1])

    await ProductService.removeProduct({ productId: 1 } as any)

    expect(mockedVariantUpdate).toHaveBeenCalledWith(
      { deleted: true },
      expect.objectContaining({ where: expect.anything() })
    )
  })
})
