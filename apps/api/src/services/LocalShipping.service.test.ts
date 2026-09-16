import { StatusCodes } from 'http-status-codes'
import { LocalShippingService } from './LocalShipping.service'
import { LocalShippingModel } from '../models/LocalShippingModel'

jest.mock('../models/LocalShippingModel', () => ({
  LocalShippingModel: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAndCountAll = LocalShippingModel.findAndCountAll as jest.Mock
const mockedFindOne = LocalShippingModel.findOne as jest.Mock
const mockedCreate = LocalShippingModel.create as jest.Mock
const mockedUpdate = LocalShippingModel.update as jest.Mock

describe('LocalShippingService.findAll', () => {
  it('formats the paginated result', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 1, rows: [{ localShippingId: 1 }] })
    const result = await LocalShippingService.findAll({ page: 1, size: 10 } as any)
    expect(result.items).toEqual([{ localShippingId: 1 }])
  })
})

describe('LocalShippingService.findDetail', () => {
  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(
      LocalShippingService.findDetail({ localShippingId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})

describe('LocalShippingService.create', () => {
  it('rejects a duplicate provinceId', async () => {
    mockedFindOne.mockResolvedValue({ localShippingId: 1 })

    await expect(
      LocalShippingService.create({ localShippingProvinceId: '11' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('defaults optional fields when creating', async () => {
    mockedFindOne.mockResolvedValue(null)

    await LocalShippingService.create({ localShippingProvinceId: '11' } as any)

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ localShippingProvinceId: '11', localShippingPricePerKg: 0 })
    )
  })
})

describe('LocalShippingService.update', () => {
  it('throws a 400 AppError when there are no fields to update', async () => {
    await expect(
      LocalShippingService.update({ localShippingId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })

  it('throws a 404 AppError when no row matched', async () => {
    mockedUpdate.mockResolvedValue([0])
    await expect(
      LocalShippingService.update({ localShippingId: 1, localShippingDuration: '2 days' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})

describe('LocalShippingService.remove', () => {
  it('resolves when a row was updated', async () => {
    mockedUpdate.mockResolvedValue([1])
    await expect(
      LocalShippingService.remove({ localShippingId: 1 } as any)
    ).resolves.toBeUndefined()
  })

  it('throws a 404 AppError when no row matched', async () => {
    mockedUpdate.mockResolvedValue([0])
    await expect(
      LocalShippingService.remove({ localShippingId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})
