import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { OrderService } from './Order.service'
import { OrdersModel } from '../models/OrderModel'
import { OrderItemsModel } from '../models/OrderItemModel'
import { AddressesModel } from '../models/AddressModel'
import { CartsModel } from '../models/CartModel'
import { ProductVariantModel } from '../models/ProductVariantModel'
import { MidtransAPIService } from './external/Midtrans.service'
import { sequelizeInit } from '../configs/database'

jest.mock('../models/OrderModel', () => ({
  OrdersModel: { findAndCountAll: jest.fn(), findOne: jest.fn(), create: jest.fn() }
}))
jest.mock('../models/OrderItemModel', () => ({ OrderItemsModel: { bulkCreate: jest.fn() } }))
jest.mock('../models/ProductModel', () => ({ ProductModel: {} }))
jest.mock('../models/AddressModel', () => ({ AddressesModel: { findOne: jest.fn() } }))
jest.mock('../models/CartModel', () => ({ CartsModel: { destroy: jest.fn() } }))
jest.mock('../models/UserModel', () => ({ UserModel: {} }))
jest.mock('../models/ProductVariantModel', () => ({
  ProductVariantModel: { findAll: jest.fn(), update: jest.fn() }
}))
jest.mock('./external/Midtrans.service', () => ({
  MidtransAPIService: { createTransaction: jest.fn() }
}))
jest.mock('../configs/database', () => ({
  sequelizeInit: {
    transaction: jest.fn(async (cb: any) => await cb({ LOCK: { UPDATE: 'UPDATE' } })),
    literal: jest.fn((sql: string) => sql)
  }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAndCountAll = OrdersModel.findAndCountAll as jest.Mock
const mockedFindOne = OrdersModel.findOne as jest.Mock
const mockedCreate = OrdersModel.create as jest.Mock
const mockedBulkCreate = OrderItemsModel.bulkCreate as jest.Mock
const mockedAddressFindOne = AddressesModel.findOne as jest.Mock
const mockedCartDestroy = CartsModel.destroy as jest.Mock
const mockedVariantFindAll = ProductVariantModel.findAll as jest.Mock
const mockedVariantUpdate = ProductVariantModel.update as jest.Mock
const mockedCreateTransaction = MidtransAPIService.createTransaction as jest.Mock

describe('OrderService.findAllOrders', () => {
  it('formats the paginated result', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 1, rows: [{ orderId: 1 }] })
    const result = await OrderService.findAllOrders(1, { page: 1, size: 10 } as any, 'user')
    expect(result.items).toEqual([{ orderId: 1 }])
  })

  it('scopes to the current user for the "user" role', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 0, rows: [] })
    await OrderService.findAllOrders(1, { page: 1, size: 10 } as any, 'user')
    const where = mockedFindAndCountAll.mock.calls[0][0].where
    expect(where.orderUserId).toBeDefined()
  })
})

describe('OrderService.findDetailOrder', () => {
  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(
      OrderService.findDetailOrder(1, 'user', { orderId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('scopes the lookup to the owning user for the "user" role', async () => {
    mockedFindOne.mockResolvedValue({ orderId: 1 })
    await OrderService.findDetailOrder(1, 'user', { orderId: 1 } as any)
    const where = mockedFindOne.mock.calls[0][0].where
    expect(where.orderUserId).toEqual({ [Op.eq]: 1 })
  })
})

describe('OrderService.createOrder', () => {
  const items = [{ productId: 1, productVariantId: 10, quantity: 2 }]
  const payload = {
    items,
    orderShippingFee: 5000,
    orderCourierCompany: 'JNE',
    orderCourierType: 'REG',
    orderShippingProvider: 'FRESH'
  } as any

  const variant = {
    productVariantId: 10,
    productVariantProductId: 1,
    productVariantName: 'Red - L',
    productVariantSellPrice: 20000,
    productVariantDiscount: 0,
    productVariantImage: 'x.jpg',
    productVariantWeight: 500,
    productVariantStock: 10
  }

  beforeEach(() => {
    mockedAddressFindOne.mockResolvedValue({
      addressUserName: 'Jane',
      addressKontak: '628123456789'
    })
    mockedVariantFindAll.mockResolvedValue([variant])
    mockedBulkCreate.mockResolvedValue(undefined)
    mockedVariantUpdate.mockResolvedValue([1])
    mockedCartDestroy.mockResolvedValue(1)
    mockedCreateTransaction.mockResolvedValue({
      token: 'snap-token',
      redirect_url: 'https://midtrans/pay'
    })
  })

  it('throws a 404 AppError when the user has no main address', async () => {
    mockedAddressFindOne.mockResolvedValue(null)

    await expect(OrderService.createOrder(1, payload)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Destination address not found'
    })
  })

  it('throws a 404 AppError when a variant is missing', async () => {
    mockedVariantFindAll.mockResolvedValue([])

    await expect(OrderService.createOrder(1, payload)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })

  it('throws a 400 AppError when stock is insufficient', async () => {
    mockedVariantFindAll.mockResolvedValue([{ ...variant, productVariantStock: 1 }])

    await expect(OrderService.createOrder(1, payload)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST
    })
  })

  it('creates the order, charges via Midtrans, and clears the cart on success', async () => {
    const order: any = { orderId: 99, orderGrandTotal: 45000 }
    order.update = jest.fn(async (data: any) => Object.assign(order, data))
    mockedCreate.mockResolvedValue(order)

    const result = await OrderService.createOrder(1, payload)

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ orderSubtotal: 40000, orderGrandTotal: 45000 }),
      expect.anything()
    )
    expect(mockedBulkCreate).toHaveBeenCalled()
    expect(mockedVariantUpdate).toHaveBeenCalled()
    expect(mockedCreateTransaction).toHaveBeenCalled()
    expect(mockedCartDestroy).toHaveBeenCalled()
    expect(result).toEqual({
      orderId: 99,
      snapToken: 'snap-token',
      redirectUrl: 'https://midtrans/pay'
    })
  })

  it('wraps a Midtrans failure into a 500 AppError', async () => {
    const order: any = { orderId: 99, orderGrandTotal: 45000 }
    order.update = jest.fn(async (data: any) => Object.assign(order, data))
    mockedCreate.mockResolvedValue(order)
    mockedCreateTransaction.mockRejectedValue(new Error('midtrans down'))

    await expect(OrderService.createOrder(1, payload)).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to create order'
    })
    expect(mockedCartDestroy).not.toHaveBeenCalled()
  })
})

describe('OrderService.updateOrder', () => {
  it('returns a static success message', async () => {
    const result = await OrderService.updateOrder(1, {} as any)
    expect(result).toEqual({ message: 'success' })
  })
})
