import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { NotificationService } from '../../services/Notification.service'
import { type IFindAllNotificationQuery } from '../../schemas/NotificationSchema'

export const findAllNotification = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const query = req.query as unknown as IFindAllNotificationQuery
    const result = await NotificationService.findAllNotifications(query)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
