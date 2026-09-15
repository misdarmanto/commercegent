import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AppLogService } from './AppLog.service'
import { AppLogModel } from '../models/AppLogModel'

jest.mock('../models/AppLogModel', () => ({
  AppLogModel: { findAndCountAll: jest.fn(), create: jest.fn() }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAndCountAll = AppLogModel.findAndCountAll as jest.Mock
const mockedCreate = AppLogModel.create as jest.Mock

describe('AppLogService.findAll', () => {
  it('filters by level when provided', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 0, rows: [] })

    await AppLogService.findAll({ page: 1, size: 10, level: 'error' } as any)

    const where = mockedFindAndCountAll.mock.calls[0][0].where
    expect(where.appLogLevel).toBe('error')
  })

  it('filters by trimmed search text when provided', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 0, rows: [] })

    await AppLogService.findAll({ page: 1, size: 10, search: '  boom  ' } as any)

    const where = mockedFindAndCountAll.mock.calls[0][0].where
    expect(where.appLogMessage).toEqual({ [Op.like]: '%boom%' })
  })

  it('formats the paginated result', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 1, rows: [{ appLogId: 1 }] })

    const result = await AppLogService.findAll({ page: 1, size: 10 } as any)

    expect(result).toEqual({
      totalItems: 1,
      items: [{ appLogId: 1 }],
      totalPages: 1,
      currentPage: 1
    })
  })

  it('wraps unexpected errors into a 500 AppError', async () => {
    mockedFindAndCountAll.mockRejectedValue(new Error('db down'))

    await expect(AppLogService.findAll({ page: 1, size: 10 } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    })
  })
})

describe('AppLogService.create', () => {
  it('defaults appLogSource and appLogMeta to null when absent', async () => {
    mockedCreate.mockResolvedValue({ appLogId: 1 })

    await AppLogService.create({ appLogLevel: 'info', appLogMessage: 'hello' } as any)

    expect(mockedCreate).toHaveBeenCalledWith({
      appLogLevel: 'info',
      appLogMessage: 'hello',
      appLogSource: null,
      appLogMeta: null
    })
  })
})
