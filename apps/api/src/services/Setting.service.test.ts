import { StatusCodes } from 'http-status-codes'
import { SettingService } from './Setting.service'
import { SettingModel } from '../models/SettingModel'

jest.mock('../models/SettingModel', () => ({
  SettingModel: { findOne: jest.fn(), create: jest.fn(), update: jest.fn() }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindOne = SettingModel.findOne as jest.Mock
const mockedCreate = SettingModel.create as jest.Mock
const mockedUpdate = SettingModel.update as jest.Mock

describe('SettingService.findSetting', () => {
  it('returns the setting found by the model', async () => {
    mockedFindOne.mockResolvedValue({ settingId: 1, whatsappNumber: '628123456789' })

    const result = await SettingService.findSetting({} as any)
    expect(result).toEqual({ settingId: 1, whatsappNumber: '628123456789' })
  })

  it('wraps unexpected errors into a 500 AppError', async () => {
    mockedFindOne.mockRejectedValue(new Error('db down'))

    await expect(SettingService.findSetting({} as any)).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to find setting'
    })
  })
})

describe('SettingService.createSetting', () => {
  it('creates a setting when none exists yet', async () => {
    mockedFindOne.mockResolvedValue(null)

    await SettingService.createSetting({ whatsappNumber: '628123456789' } as any)

    expect(mockedCreate).toHaveBeenCalledWith({ whatsappNumber: '628123456789' })
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('updates the existing setting instead of creating a duplicate', async () => {
    mockedFindOne.mockResolvedValue({ settingId: 1 })

    await SettingService.createSetting({ whatsappNumber: '628123456789' } as any)

    expect(mockedUpdate).toHaveBeenCalledWith(
      { whatsappNumber: '628123456789' },
      expect.objectContaining({ where: expect.anything() })
    )
    expect(mockedCreate).not.toHaveBeenCalled()
  })
})
