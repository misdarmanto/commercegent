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
    const params = req.params as unknown as IFindDetailNotificationParams
    const result = await NotificationService.findDetailNotification(params.notificationId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
