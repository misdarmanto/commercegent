import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { Expo } from 'expo-server-sdk'
import { NotificationModel } from '../models/notifications'
import { UserModel } from '../models/user'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  ICreateNotificationBody,
  IFindAllNotificationQuery,
  IUpdateNotificationBody,
  IUpdatePushTokenBody
} from '../schemas/NotificationSchema'

interface PushPayload {
  title: string
  body: string
}

async function sendExpoPushNotification(
  expoPushToken: string,
  data: PushPayload
): Promise<string> {
  const expo = new Expo({
    accessToken: process.env.ACCESS_TOKEN,
    useFcmV1: true
  })

  const chunks = expo.chunkPushNotifications([{ to: expoPushToken, ...data }])
  const tickets: Array<{ status: string; id?: string; details?: { error?: string } }> = []

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
      tickets.push(...ticketChunk)
    } catch (error) {
      logger.error('[NotificationService] sendPush chunk failed', { error })
    }
  }

  let response = ''

  for (const ticket of tickets) {
    if (ticket.status === 'error') {
      if (ticket.details != null && ticket.details.error === 'DeviceNotRegistered') {
        response = 'DeviceNotRegistered'
      }
    }

    if (ticket.status === 'ok' && ticket.id != null) {
      response = ticket.id
    }
  }

  return response
}

export class NotificationService {
  static async createNotification(body: ICreateNotificationBody) {
    try {
      const users = await UserModel.findAll({
        where: {
          deleted: { [Op.eq]: 0 }
        },
        attributes: ['userFcmId']
      })

      for (const user of users) {
        if (user.userFcmId != null && user.userFcmId !== '') {
          void sendExpoPushNotification(user.userFcmId, {
            title: body.notificationName,
            body: body.notificationMessage
          })
        }
      }

      await NotificationModel.create({
        notificationName: body.notificationName,
        notificationMessage: body.notificationMessage,
        deleted: 0
      })

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[NotificationService] createNotification failed: ${String(error)}`)
      throw new AppError(
        'Failed to create notification',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async updateNotification(body: IUpdateNotificationBody) {
    try {
      const existing = await NotificationModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          notificationId: { [Op.eq]: body.notificationId }
        }
      })

      if (existing == null) {
        throw new AppError('not found!', StatusCodes.NOT_FOUND)
      }

      const newData: Record<string, unknown> = {}
      if (body.notificationName != null && body.notificationName.length > 0) {
        newData.notificationName = body.notificationName
      }
      if (body.notificationMessage != null && body.notificationMessage.length > 0) {
        newData.notificationMessage = body.notificationMessage
      }

      await NotificationModel.update(newData, {
        where: {
          deleted: { [Op.eq]: 0 },
          notificationId: { [Op.eq]: body.notificationId }
        }
      })

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[NotificationService] updateNotification failed: ${String(error)}`)
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
          deleted: { [Op.eq]: 0 },
          notificationId: { [Op.eq]: notificationId }
        }
      })

      if (row == null) {
        throw new AppError('notification not found!', StatusCodes.NOT_FOUND)
      }

      row.deleted = 1
      await row.save()

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[NotificationService] removeNotification failed: ${String(error)}`)
      throw new AppError(
        'Failed to remove notification',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findAllNotifications(query: IFindAllNotificationQuery) {
    try {
      const page = new Pagination(query.page, query.size)

      const result = await NotificationModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          ...(Boolean(query.search) && {
            [Op.or]: [{ notificationName: { [Op.like]: `%${query.search}%` } }]
          })
        },
        order: [['notificationId', 'desc']],
        ...(query.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[NotificationService] findAllNotifications failed: ${String(error)}`)
      throw new AppError(
        'Failed to fetch notifications',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findDetailNotification(notificationId: number) {
    try {
      const row = await NotificationModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          notificationId: { [Op.eq]: notificationId }
        }
      })

      if (row == null) {
        throw new AppError('not found!', StatusCodes.NOT_FOUND)
      }

      return row
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(
        `[NotificationService] findDetailNotification failed: ${String(error)}`
      )
      throw new AppError(
        'Failed to fetch notification',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async updatePushToken(userId: number, body: IUpdatePushTokenBody) {
    try {
      await UserModel.update(
        { userFcmId: body.userFcmId },
        {
          where: {
            deleted: { [Op.eq]: 0 },
            userId: { [Op.eq]: userId }
          }
        }
      )

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[NotificationService] updatePushToken failed: ${String(error)}`)
      throw new AppError('Failed to update push token', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
