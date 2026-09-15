import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { NotificationService } from './Notification.service'
import { NotificationModel } from '../models/NotificationModel'
import { UserModel } from '../models/UserModel'

jest.mock('../models/NotificationModel', () => ({
  NotificationModel: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findAndCountAll: jest.fn()
  }
}))
jest.mock('../models/UserModel', () => ({ UserModel: { findAll: jest.fn(), update: jest.fn() } }))
jest.mock('expo-server-sdk', () => ({
  Expo: jest.fn().mockImplementation(() => ({
    chunkPushNotifications: jest.fn().mockReturnValue([]),
    sendPushNotificationsAsync: jest.fn().mockResolvedValue([])
  }))
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedCreate = NotificationModel.create as jest.Mock
const mockedFindOne = NotificationModel.findOne as jest.Mock
const mockedUpdate = NotificationModel.update as jest.Mock
const mockedFindAndCountAll = NotificationModel.findAndCountAll as jest.Mock
const mockedUserFindAll = UserModel.findAll as jest.Mock
const mockedUserUpdate = UserModel.update as jest.Mock

describe('NotificationService.createNotification', () => {
  it('creates the notification record', async () => {
    mockedUserFindAll.mockResolvedValue([{ userFcmId: '' }, { userFcmId: 'token-1' }])
    mockedCreate.mockResolvedValue({ notificationId: 1 })

    await NotificationService.createNotification({
      notificationName: 'Promo',
      notificationMessage: 'Diskon 50%'
    } as any)

    expect(mockedCreate).toHaveBeenCalledWith({
      notificationName: 'Promo',
      notificationMessage: 'Diskon 50%',
      deleted: false
    })
  })
})

describe('NotificationService.updateNotification', () => {
  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(
      NotificationService.updateNotification({ notificationId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('only applies provided, non-empty fields', async () => {
    mockedFindOne.mockResolvedValue({ notificationId: 1 })

    await NotificationService.updateNotification({
      notificationId: 1,
      notificationName: 'New title'
    } as any)

    expect(mockedUpdate).toHaveBeenCalledWith(
      { notificationName: 'New title' },
      expect.objectContaining({ where: expect.anything() })
    )
  })
})

describe('NotificationService.removeNotification', () => {
  it('soft-deletes the notification', async () => {
    const row = { deleted: false, save: jest.fn() }
    mockedFindOne.mockResolvedValue(row)

    await NotificationService.removeNotification(1)

    expect(row.deleted).toBe(true)
    expect(row.save).toHaveBeenCalled()
  })

  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(NotificationService.removeNotification(1)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })
})

describe('NotificationService.findAllNotifications', () => {
  it('adds a search filter using Op.or when search is provided', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 0, rows: [] })

    await NotificationService.findAllNotifications({ page: 1, size: 10, search: 'promo' } as any)

    const where = mockedFindAndCountAll.mock.calls[0][0].where
    expect(where[Op.or]).toEqual([{ notificationName: { [Op.like]: '%promo%' } }])
  })

  it('formats the paginated result', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 1, rows: [{ notificationId: 1 }] })
    const result = await NotificationService.findAllNotifications({ page: 1, size: 10 } as any)
    expect(result.items).toEqual([{ notificationId: 1 }])
  })
})

describe('NotificationService.findDetailNotification', () => {
  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(
      NotificationService.findDetailNotification({ notificationId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})

describe('NotificationService.updatePushToken', () => {
  it('updates the users push token', async () => {
    await NotificationService.updatePushToken(1, { userFcmId: 'new-token' } as any)

    expect(mockedUserUpdate).toHaveBeenCalledWith(
      { userFcmId: 'new-token' },
      expect.objectContaining({ where: expect.anything() })
    )
  })
})
