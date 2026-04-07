import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { NotificationService } from '../../services/Notification.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdatePushTokenBody } from '../../schemas/NotificationSchema'
import { AppError } from '../../utilities/appError'

export const updatePushToken = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdatePushTokenBody
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await NotificationService.updatePushToken(userId, payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Push token updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
