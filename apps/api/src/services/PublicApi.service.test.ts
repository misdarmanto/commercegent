import { StatusCodes } from 'http-status-codes'
import { PublicApiService } from './PublicApi.service'
import { ProductModel } from '../models/ProductModel'
import { OrdersModel } from '../models/OrderModel'

jest.mock('../models/ProductModel', () => ({ ProductModel: { findOne: jest.fn() } }))
jest.mock('../models/OrderModel', () => ({ OrdersModel: { findAndCountAll: jest.fn() } }))
jest.mock('../models/UserModel', () => ({ UserModel: {} }))
jest.mock('../models/OrderItemModel', () => ({ OrderItemsModel: {} }))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindOne = ProductModel.findOne as jest.Mock
const mockedFindAndCountAll = OrdersModel.findAndCountAll as jest.Mock

describe('PublicApiService.findAllOrdersPublic', () => {
  it('formats the paginated result', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 1, rows: [{ orderId: 1 }] })

    const result = await PublicApiService.findAllOrdersPublic({ page: 1, size: 10 } as any)
    expect(result.items).toEqual([{ orderId: 1 }])
  })

  it('filters by orderStatus when provided', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 0, rows: [] })

    await PublicApiService.findAllOrdersPublic({ page: 1, size: 10, orderStatus: 'done' } as any)

    const where = mockedFindAndCountAll.mock.calls[0][0].where
    expect(where.orderStatus).toBeDefined()
  })
})

describe('PublicApiService.createProductPublic', () => {
  it('rejects when both code and barcode are already registered', async () => {
    mockedFindOne.mockResolvedValue({ productCode: 'A1', productBarcode: 'B1' })

    await expect(
      PublicApiService.createProductPublic({ code: 'A1', barcode: 'B1', price: 1000 } as any)
    ).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Product code dan barcode sudah terdaftar'
    })
  })

  it('rejects when only the code is already registered', async () => {
    mockedFindOne.mockResolvedValue({ productCode: 'A1', productBarcode: 'OTHER' })

    await expect(
      PublicApiService.createProductPublic({ code: 'A1', price: 1000 } as any)
    ).rejects.toMatchObject({ message: 'Product code sudah terdaftar' })
  })

  it('resolves without error when there is no duplicate', async () => {
    mockedFindOne.mockResolvedValue(null)

    await expect(
      PublicApiService.createProductPublic({ code: 'NEW', price: 1000 } as any)
    ).resolves.toBeUndefined()
  })
})

describe('PublicApiService.updateProductPublic', () => {
  it('throws a 404 AppError when the product code does not exist', async () => {
    mockedFindOne.mockResolvedValue(null)

    await expect(
      PublicApiService.updateProductPublic({ code: 'MISSING' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('throws a 400 AppError when there is no data to update', async () => {
    mockedFindOne.mockResolvedValue({ productCode: 'A1', update: jest.fn() })

    await expect(
      PublicApiService.updateProductPublic({ code: 'A1' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })

  it('only applies the provided fields', async () => {
    const product = { productCode: 'A1', update: jest.fn() }
    mockedFindOne.mockResolvedValue(product)

    await PublicApiService.updateProductPublic({ code: 'A1', stock: 10 } as any)

    expect(product.update).toHaveBeenCalledWith({ productStock: 10 })
  })
})
