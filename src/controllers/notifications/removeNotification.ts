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
    const payload = req.query as unknown as IRemoveNotificationQuery
    await NotificationService.removeNotification(payload.notificationId)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Notification removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
