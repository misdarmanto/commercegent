import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { SettingService } from '../../services/Setting.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IRemoveSettingParams } from '../../schemas/SettingSchema'
import { AppError } from '../../utilities/appError'

export const removeSetting = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const params = req.params as unknown as IRemoveSettingParams
    const result = await SettingService.removeSetting(userId, params)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
