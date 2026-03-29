import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { requestChecker } from '../../utilities/requestCheker'
import {
  NotificationModel,
  type NotificationAttributes
} from '../../models/notifications'
import { handleServerError } from '../../utilities/requestHandler'

export const updateNotification = async (req: any, res: Response): Promise<any> => {
  const requestBody = req.body as NotificationAttributes

  const emptyField = requestChecker({
    requireList: ['notificationId'],
    requestData: requestBody
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    const result = await NotificationModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        notificationId: { [Op.eq]: requestBody.notificationId }
      }
    })

    if (result == null) {
      const message = 'not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    const newData: NotificationAttributes | any = {
      ...(requestBody.notificationName.length > 0 && {
        notificationName: requestBody.notificationName
      }),
      ...(requestBody.notificationMessage.length > 0 && {
        notificationMessage: requestBody.notificationMessage
      })
    }

    await NotificationModel.update(newData, {
      where: {
        deleted: { [Op.eq]: 0 },
        notificationId: { [Op.eq]: requestBody.notificationId }
      }
    })

    const response = ResponseData.default
    response.data = { message: 'success' }
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
