import { StatusCodes } from 'http-status-codes'
import { StatisticService } from './Statistic.service'
import { ProductModel } from '../models/ProductModel'
import { OrdersModel } from '../models/OrderModel'
import { UserModel } from '../models/UserModel'
import { VisitorModel } from '../models/VisitorModel'

jest.mock('../models/ProductModel', () => ({ ProductModel: { count: jest.fn() } }))
jest.mock('../models/OrderModel', () => ({ OrdersModel: { count: jest.fn() } }))
jest.mock('../models/UserModel', () => ({ UserModel: { count: jest.fn() } }))
jest.mock('../models/VisitorModel', () => ({ VisitorModel: { findAll: jest.fn(), create: jest.fn() } }))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedProductCount = ProductModel.count as jest.Mock
const mockedOrderCount = OrdersModel.count as jest.Mock
const mockedUserCount = UserModel.count as jest.Mock
const mockedVisitorFindAll = VisitorModel.findAll as jest.Mock
const mockedVisitorCreate = VisitorModel.create as jest.Mock

describe('StatisticService.findTotal', () => {
  it('aggregates all counts into a single object', async () => {
    mockedProductCount.mockResolvedValue(10)
    mockedOrderCount.mockResolvedValueOnce(3).mockResolvedValueOnce(7)
    mockedUserCount.mockResolvedValueOnce(20).mockResolvedValueOnce(12).mockResolvedValueOnce(8)

    const result = await StatisticService.findTotal()

    expect(result).toEqual({
      totalProduct: 10,
      totalOrder: 3,
      totalTransaction: 7,
      totalCustomer: 20,
      totalUserPria: 12,
      totalUserWanita: 8
    })
  })

  it('wraps an unexpected error into a 500 AppError', async () => {
    mockedProductCount.mockRejectedValue(new Error('db down'))

    await expect(StatisticService.findTotal()).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    })
  })
})

describe('StatisticService.findTotalVisitor', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns one bucket per interval within the range, defaulting to zero', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-01-02T00:00:00.000Z').getTime())
    mockedVisitorFindAll.mockResolvedValue([])

    const result = await StatisticService.findTotalVisitor({ range: '1d', interval: '1h' } as any)

    expect(result).toHaveLength(24)
    expect(result.every((bucket) => bucket.total === 0)).toBe(true)
  })

  it('counts visitors into their matching bucket', async () => {
    const nowMs = new Date('2024-01-02T00:00:00.000Z').getTime()
    jest.spyOn(Date, 'now').mockReturnValue(nowMs)
    mockedVisitorFindAll.mockResolvedValue([
      { createdAt: new Date(nowMs) },
      { createdAt: new Date(nowMs) },
      { createdAt: new Date(nowMs - 60 * 60 * 1000) }
    ])

    const result = await StatisticService.findTotalVisitor({ range: '1d', interval: '1h' } as any)

    const totalVisitors = result.reduce((sum, bucket) => sum + bucket.total, 0)
    expect(totalVisitors).toBe(3)
  })

  it('produces 7 buckets for a 7-day range with 1-day intervals', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-01-08T00:00:00.000Z').getTime())
    mockedVisitorFindAll.mockResolvedValue([])

    const result = await StatisticService.findTotalVisitor({ range: '7d', interval: '1d' } as any)
    expect(result).toHaveLength(7)
  })
})

describe('StatisticService.createVisitor', () => {
  it('creates a visitor record', async () => {
    mockedVisitorCreate.mockResolvedValue({ visitorId: 1 })

    const result = await StatisticService.createVisitor({ visitorMeta: 'ua' } as any)

    expect(mockedVisitorCreate).toHaveBeenCalledWith({ deleted: false, visitorMeta: 'ua' })
    expect(result).toEqual({ visitorId: 1 })
  })
})
