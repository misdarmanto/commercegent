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

export const removeNofication = async (req: any, res: Response): Promise<any> => {
  const requestQuery = req.query as NotificationAttributes

  const emptyField = requestChecker({
    requireList: ['notificationId'],
    requestData: requestQuery
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
        notificationId: { [Op.eq]: requestQuery.notificationId }
      }
    })

    if (result == null) {
      const message = 'notification not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    result.deleted = 1
    void result.save()

    const response = ResponseData.default
    response.data = { message: 'success' }
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
