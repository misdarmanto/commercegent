import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { NotificationService } from '../../services/Notification.service'
import { type IFindDetailNotificationParams } from '../../schemas/NotificationSchema'

export const findDetailNotification = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IFindDetailNotificationParams
    const result = await NotificationService.findDetailNotification(
      payload.notificationId
    )

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
