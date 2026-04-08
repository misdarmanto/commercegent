import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { SettingService } from '../../services/Setting.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IRemoveSetting } from '../../schemas/SettingSchema'
import { AppError } from '../../utilities/appError'

export const removeSetting = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IRemoveSetting
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await SettingService.removeSetting(userId, payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Setting removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
