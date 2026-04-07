import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { NotificationService } from '../../services/Notification.service'
import { type ICreateNotificationBody } from '../../schemas/NotificationSchema'

export const createNotification = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateNotificationBody
    await NotificationService.createNotification(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Notification created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
