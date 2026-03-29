import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { NotificationService } from '../../services/Notification.service'
import { type IRemoveNotificationQuery } from '../../schemas/NotificationSchema'

export const removeNotification = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const query = req.query as unknown as IRemoveNotificationQuery
    const result = await NotificationService.removeNotification(query.notificationId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
