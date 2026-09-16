import { StatusCodes } from 'http-status-codes'
import { ShippingService } from './Shipping.service'
import { ProductVariantModel } from '../models/ProductVariantModel'
import { AddressesModel } from '../models/AddressModel'
import { LocalShippingModel } from '../models/LocalShippingModel'
import { OrdersModel } from '../models/OrderModel'
import { OrderItemsModel } from '../models/OrderItemModel'
import { sequelizeInit } from '../configs/database'
import { BiteShipAPIService } from './external/BiteShipApi.service'

jest.mock('../models/ProductVariantModel', () => ({ ProductVariantModel: { findAll: jest.fn() } }))
jest.mock('../models/AddressModel', () => ({ AddressesModel: { findOne: jest.fn() } }))
jest.mock('../models/LocalShippingModel', () => ({ LocalShippingModel: { findAll: jest.fn() } }))
jest.mock('../models/OrderModel', () => ({ OrdersModel: { findByPk: jest.fn() } }))
jest.mock('../models/OrderItemModel', () => ({ OrderItemsModel: { findAll: jest.fn() } }))
jest.mock('../models/ProductModel', () => ({ ProductModel: {} }))
jest.mock('../configs/database', () => ({
  sequelizeInit: { transaction: jest.fn(async (cb: any) => await cb({})) }
}))
jest.mock('./external/BiteShipApi.service', () => ({
  BiteShipAPIService: { post: jest.fn(), get: jest.fn() },
  getBiteShipErrorDetail: jest.fn(() => 'error-detail')
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedVariantFindAll = ProductVariantModel.findAll as jest.Mock
const mockedAddressFindOne = AddressesModel.findOne as jest.Mock
const mockedLocalShippingFindAll = LocalShippingModel.findAll as jest.Mock
const mockedOrderFindByPk = OrdersModel.findByPk as jest.Mock
const mockedOrderItemsFindAll = OrderItemsModel.findAll as jest.Mock
const mockedBiteshipPost = BiteShipAPIService.post as jest.Mock
const mockedBiteshipGet = BiteShipAPIService.get as jest.Mock

describe('ShippingService.getShippingRates', () => {
  const payload = [{ productVariantId: 1, quantity: 2 }] as any

  it('throws a 404 AppError when a variant is missing', async () => {
    mockedVariantFindAll.mockResolvedValue([])

    await expect(ShippingService.getShippingRates(1, payload)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })

  it('throws a 404 AppError when the store address is missing', async () => {
    mockedVariantFindAll.mockResolvedValue([{ productVariantId: 1, productVariantWeight: 1 }])
    mockedAddressFindOne.mockResolvedValueOnce(null)

    await expect(ShippingService.getShippingRates(1, payload)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Store address not found'
    })
  })

  it('returns a local shipping rate when destination matches a local shipping zone', async () => {
    mockedVariantFindAll.mockResolvedValue([{ productVariantId: 1, productVariantWeight: 2 }])
    mockedAddressFindOne
      .mockResolvedValueOnce({ addressLatitude: 1, addressLongitude: 1 })
      .mockResolvedValueOnce({ addressProvinsiId: '11', addressKabupatenId: '1101' })
    mockedLocalShippingFindAll.mockResolvedValue([
      {
        localShippingProvinceId: '11',
        localShippingKabupatenId: '1101',
        localShippingPricePerKg: 15000,
        localShippingCompanyName: 'FRESH Courier',
        localShippingProvinceName: 'DKI Jakarta',
        localShippingDuration: '1 day'
      }
    ])

    const result = await ShippingService.getShippingRates(1, payload)

    expect(result).toEqual([
      expect.objectContaining({ provider: 'FRESH', price: 15000, courier_code: 'local' })
    ])
  })

  it('falls back to BiteShip rates when there is no local shipping match', async () => {
    mockedVariantFindAll.mockResolvedValue([
      { productVariantId: 1, productVariantWeight: 2, productVariantName: 'X', productVariantPrice: 1000 }
    ])
    mockedAddressFindOne
      .mockResolvedValueOnce({ addressLatitude: 1, addressLongitude: 1 })
      .mockResolvedValueOnce({
        addressProvinsiId: '99',
        addressKabupatenId: '9999',
        addressLatitude: 2,
        addressLongitude: 2
      })
    mockedLocalShippingFindAll.mockResolvedValue([])
    mockedBiteshipPost.mockResolvedValue({ data: { pricing: [{ price: 20000 }] } })

    const result = await ShippingService.getShippingRates(1, payload)

    expect(mockedBiteshipPost).toHaveBeenCalledWith(
      '/rates/couriers',
      expect.objectContaining({ couriers: 'gojek,grab,paxel,jne,sicepat' })
    )
    expect(result).toEqual([{ price: 20000, provider: 'BITESHIP' }])
  })
})

describe('ShippingService.createDraftFromOrder', () => {
  it('throws a 404 AppError when the order is not found', async () => {
    mockedOrderFindByPk.mockResolvedValue(null)

    await expect(
      ShippingService.createDraftFromOrder({ orderId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('throws a 400 AppError when the order is not in PROCESS status', async () => {
    mockedOrderFindByPk.mockResolvedValue({ orderStatus: 'waiting' })

    await expect(
      ShippingService.createDraftFromOrder({ orderId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })

  it('throws a 409 AppError when a draft already exists', async () => {
    mockedOrderFindByPk.mockResolvedValue({ orderStatus: 'process', orderDraftId: 'DRAFT-1' })

    await expect(
      ShippingService.createDraftFromOrder({ orderId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.CONFLICT })
  })

  it('creates a FRESH draft without calling BiteShip', async () => {
    const order: any = { orderId: 5, orderStatus: 'process', orderShippingProvider: 'FRESH' }
    order.update = jest.fn(async (data: any) => Object.assign(order, data))
    mockedOrderFindByPk.mockResolvedValue(order)

    const result = await ShippingService.createDraftFromOrder({ orderId: 5 } as any)

    expect(order.update).toHaveBeenCalledWith(
      { orderDraftId: '#FRESH-5', orderStatus: 'draft' },
      expect.anything()
    )
    expect(result).toEqual({ draftOrderId: '#FRESH-5' })
    expect(mockedBiteshipPost).not.toHaveBeenCalled()
  })

  it('throws a 400 AppError when the BiteShip order has no items', async () => {
    mockedOrderFindByPk.mockResolvedValue({
      orderId: 5,
      orderStatus: 'process',
      orderShippingProvider: 'BITESHIP'
    })
    mockedAddressFindOne.mockResolvedValue({})
    mockedOrderItemsFindAll.mockResolvedValue([])

    await expect(
      ShippingService.createDraftFromOrder({ orderId: 5 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST, message: 'Order items empty' })
  })

  it('creates a BiteShip draft and saves the returned draft id', async () => {
    const order = {
      orderId: 5,
      orderStatus: 'process',
      orderShippingProvider: 'BITESHIP',
      orderUserId: 1,
      orderReferenceId: 'REF-1',
      update: jest.fn()
    }
    mockedOrderFindByPk.mockResolvedValue(order)
    mockedAddressFindOne.mockResolvedValue({ addressUserName: 'Jane' })
    mockedOrderItemsFindAll.mockResolvedValue([
      { orderItemProductName: 'Item', orderItemTotalPrice: 1000, orderItemQuantity: 1 }
    ])
    mockedBiteshipPost.mockResolvedValue({ data: { id: 'BITESHIP-DRAFT-1' } })

    const result = await ShippingService.createDraftFromOrder({ orderId: 5 } as any)

    expect(order.update).toHaveBeenCalledWith(
      { orderDraftId: 'BITESHIP-DRAFT-1', orderStatus: 'draft' },
      expect.anything()
    )
    expect(result).toMatchObject({ draftOrderId: 'BITESHIP-DRAFT-1' })
  })
})

describe('ShippingService.confirmDraftOrder', () => {
  it('throws a 404 AppError when the order is not found', async () => {
    mockedOrderFindByPk.mockResolvedValue(null)
    await expect(
      ShippingService.confirmDraftOrder({ orderId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('throws a 400 AppError when there is no draft id', async () => {
    mockedOrderFindByPk.mockResolvedValue({ orderDraftId: null })
    await expect(
      ShippingService.confirmDraftOrder({ orderId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })

  it('confirms a FRESH order and sets waybill/tracking ids', async () => {
    const order = {
      orderId: 5,
      orderDraftId: '#FRESH-5',
      orderStatus: 'draft',
      orderShippingProvider: 'FRESH',
      update: jest.fn()
    }
    mockedOrderFindByPk.mockResolvedValue(order)

    const result = await ShippingService.confirmDraftOrder({ orderId: 5 } as any)

    expect(order.update).toHaveBeenCalledWith(
      expect.objectContaining({ orderStatus: 'delivery', orderWaybillId: '5-FRESH' }),
      expect.anything()
    )
    expect(result).toMatchObject({ courier: 'FRESH' })
  })

  it('confirms a BiteShip order using the confirm endpoint', async () => {
    const order = {
      orderId: 5,
      orderDraftId: 'DRAFT-1',
      orderStatus: 'draft',
      orderShippingProvider: 'BITESHIP',
      update: jest.fn()
    }
    mockedOrderFindByPk.mockResolvedValue(order)
    mockedBiteshipPost.mockResolvedValue({
      data: { courier: { waybill_id: 'WB-1', tracking_id: 'TRK-1' } }
    })

    await ShippingService.confirmDraftOrder({ orderId: 5 } as any)

    expect(mockedBiteshipPost).toHaveBeenCalledWith('/draft_orders/DRAFT-1/confirm')
    expect(order.update).toHaveBeenCalledWith(
      expect.objectContaining({ orderWaybillId: 'WB-1', orderTrackingId: 'TRK-1' }),
      expect.anything()
    )
  })
})

describe('ShippingService.trackShipment', () => {
  it('throws a 404 AppError when the order is not found', async () => {
    mockedOrderFindByPk.mockResolvedValue(null)
    await expect(ShippingService.trackShipment({ orderId: 1 } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })

  it('throws a 400 AppError when shipment data is missing', async () => {
    mockedOrderFindByPk.mockResolvedValue({ orderWaybillId: null })
    await expect(ShippingService.trackShipment({ orderId: 1 } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST
    })
  })

  it('builds tracking info locally for a FRESH order', async () => {
    mockedOrderFindByPk.mockResolvedValue({
      orderWaybillId: 'WB-1',
      orderCourierCompany: 'FRESH',
      orderShippingProvider: 'FRESH',
      orderUserId: 1,
      orderStatus: 'delivery'
    })
    mockedAddressFindOne
      .mockResolvedValueOnce({ addressUserName: 'Admin', addressDetail: 'HQ' })
      .mockResolvedValueOnce({ addressUserName: 'Jane', addressDetail: 'Home' })

    const result = await ShippingService.trackShipment({ orderId: 1 } as any)

    expect(result).toMatchObject({ waybill_id: 'WB-1', courier: { company: 'FRESH' } })
  })

  it('fetches tracking info from BiteShip for a BiteShip order', async () => {
    mockedOrderFindByPk.mockResolvedValue({
      orderWaybillId: 'WB-1',
      orderCourierCompany: 'jne',
      orderShippingProvider: 'BITESHIP'
    })
    mockedBiteshipGet.mockResolvedValue({ data: { status: 'delivered' } })

    const result = await ShippingService.trackShipment({ orderId: 1 } as any)

    expect(mockedBiteshipGet).toHaveBeenCalledWith('/trackings/WB-1/couriers/jne')
    expect(result).toEqual({ status: 'delivered' })
  })
})
