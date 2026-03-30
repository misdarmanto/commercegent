import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { NotificationService } from '../../services/Notification.service'
import { type IUpdateNotificationBody } from '../../schemas/NotificationSchema'

export const updateNotification = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateNotificationBody
    const result = await NotificationService.updateNotification(payload)

    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        data: result,
        message: 'Notification updated successfully'
      })
    )
  } catch (error) {
    return handleError(res, error)
  }
}
