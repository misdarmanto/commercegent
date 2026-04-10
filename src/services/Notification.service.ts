import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { Expo } from 'expo-server-sdk'
import { NotificationModel } from '../models/NotificationModel'
import { UserModel } from '../models/UserModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  ICreateNotification,
  IFindAllNotification,
  IFindDetailNotification,
  IUpdateNotification,
  IUpdatePushToken
} from '../schemas/NotificationSchema'

async function sendExpoPushNotification(
  expoPushToken: string,
  payload: ICreateNotification
): Promise<string> {
  const expo = new Expo({
    accessToken: process.env.ACCESS_TOKEN,
    useFcmV1: true
  })

  const chunks = expo.chunkPushNotifications([{ to: expoPushToken, ...payload }])
  const tickets: Array<{ status: string; id?: string; details?: { error?: string } }> = []

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
      tickets.push(...ticketChunk)
    } catch (error) {
      logger.error('[NotificationService] sendPush chunk failed', { error })
    }
  }

  let result = ''

  for (const ticket of tickets) {
    if (ticket.status === 'error') {
      if (ticket.details != null && ticket.details.error === 'DeviceNotRegistered') {
        result = 'DeviceNotRegistered'
      }
    }

    if (ticket.status === 'ok' && ticket.id != null) {
      result = ticket.id
    }
  }

  return result
}

export class NotificationService {
  static async createNotification(payload: ICreateNotification) {
    try {
      const users = await UserModel.findAll({
        where: {
          deleted: { [Op.eq]: false }
        },
        attributes: ['userFcmId']
      })

      for (const user of users) {
        if (user.userFcmId != null && user.userFcmId !== '') {
          void sendExpoPushNotification(user.userFcmId, {
            notificationName: payload.notificationName,
            notificationMessage: payload.notificationMessage
          })
        }
      }

      await NotificationModel.create({
        notificationName: payload.notificationName,
        notificationMessage: payload.notificationMessage,
        deleted: false
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[NotificationService] createNotification failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to create notification',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async updateNotification(payload: IUpdateNotification) {
    try {
      const existing = await NotificationModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          notificationId: { [Op.eq]: payload.notificationId }
        }
      })

      if (existing == null) {
        throw new AppError('not found!', StatusCodes.NOT_FOUND)
      }

      const newData: Record<string, unknown> = {}
      if (payload.notificationName != null && payload.notificationName.length > 0) {
        newData.notificationName = payload.notificationName
      }
      if (payload.notificationMessage != null && payload.notificationMessage.length > 0) {
        newData.notificationMessage = payload.notificationMessage
      }

      await NotificationModel.update(newData, {
        where: {
          deleted: { [Op.eq]: false },
          notificationId: { [Op.eq]: payload.notificationId }
        }
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[NotificationService] updateNotification failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to update notification',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async removeNotification(notificationId: number) {
    try {
      const row = await NotificationModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          notificationId: { [Op.eq]: notificationId }
        }
      })

      if (row == null) {
        throw new AppError('notification not found!', StatusCodes.NOT_FOUND)
      }

      row.deleted = true
      await row.save()
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[NotificationService] removeNotification failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to remove notification',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findAllNotifications(payload: IFindAllNotification) {
    try {
      const page = new Pagination(payload.page, payload.size)

      const result = await NotificationModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: false },
          ...(Boolean(payload.search) && {
            [Op.or]: [{ notificationName: { [Op.like]: `%${payload.search}%` } }]
          })
        },
        order: [['notificationId', 'desc']],
        ...(payload.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[NotificationService] findAllNotifications failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to find notifications',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findDetailNotification(payload: IFindDetailNotification) {
    try {
      const result = await NotificationModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          notificationId: { [Op.eq]: payload.notificationId }
        }
      })

      if (result == null) {
        throw new AppError('not found!', StatusCodes.NOT_FOUND)
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[NotificationService] findDetailNotification failed: ${String(serviceError)}`
      )
      throw new AppError('Failed to find notification', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updatePushToken(userId: number, payload: IUpdatePushToken) {
    try {
      await UserModel.update(
        { userFcmId: payload.userFcmId },
        {
          where: {
            deleted: { [Op.eq]: false },
            userId: { [Op.eq]: userId }
          }
        }
      )
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[NotificationService] updatePushToken failed: ${String(serviceError)}`
      )
      throw new AppError('Failed to update push token', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
