import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { SettingService } from '../../services/Setting.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type ICreateSettingBody } from '../../schemas/SettingSchema'
import { AppError } from '../../utilities/appError'

export const createSetting = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateSettingBody
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await SettingService.createSetting(userId, payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Setting created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
