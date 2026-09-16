import { StatusCodes } from 'http-status-codes'
import { BannerService } from './Banner.service'
import { BannerModel } from '../models/BannerModel'
import { sequelizeInit } from '../configs/database'

jest.mock('../models/BannerModel', () => ({
  BannerModel: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    max: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))
jest.mock('../configs/database', () => ({
  sequelizeInit: {
    transaction: jest.fn(async (cb: any) => await cb({ LOCK: { UPDATE: 'UPDATE' } }))
  }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAndCountAll = BannerModel.findAndCountAll as jest.Mock
const mockedFindOne = BannerModel.findOne as jest.Mock
const mockedMax = BannerModel.max as jest.Mock
const mockedCreate = BannerModel.create as jest.Mock
const mockedUpdate = BannerModel.update as jest.Mock

describe('BannerService.findAllBanners', () => {
  it('formats the paginated result', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 1, rows: [{ bannerId: 1 }] })

    const result = await BannerService.findAllBanners({ page: 1, size: 10 } as any)
    expect(result.items).toEqual([{ bannerId: 1 }])
  })
})

describe('BannerService.createBanner', () => {
  it('creates the banner directly when no order conflict exists', async () => {
    mockedFindOne.mockResolvedValue(null)
    mockedCreate.mockResolvedValue({ bannerId: 1 })

    await BannerService.createBanner({ bannerImage: 'a.jpg', bannerOrder: 2 } as any)

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ bannerImage: 'a.jpg', bannerOrder: 2 }),
      expect.anything()
    )
  })

  it('bumps the conflicting banner to the next order before creating', async () => {
    const conflicting = { update: jest.fn() }
    mockedFindOne.mockResolvedValue(conflicting)
    mockedMax.mockResolvedValue(5)
    mockedCreate.mockResolvedValue({ bannerId: 2 })

    await BannerService.createBanner({ bannerImage: 'b.jpg', bannerOrder: 0 } as any)

    expect(conflicting.update).toHaveBeenCalledWith({ bannerOrder: 6 }, expect.anything())
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ bannerOrder: 0 }),
      expect.anything()
    )
  })

  it('wraps a transaction failure into a 500 AppError', async () => {
    mockedFindOne.mockRejectedValue(new Error('lock timeout'))

    await expect(BannerService.createBanner({} as any)).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    })
  })
})

describe('BannerService.removeBanner', () => {
  it('resolves when a row was updated', async () => {
    mockedUpdate.mockResolvedValue([1])
    await expect(BannerService.removeBanner({ bannerId: 1 } as any)).resolves.toBeUndefined()
  })

  it('throws a 404 AppError when no row matched', async () => {
    mockedUpdate.mockResolvedValue([0])
    await expect(BannerService.removeBanner({ bannerId: 1 } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })
})
