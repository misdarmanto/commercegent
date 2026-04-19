import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { SettingService } from '../../services/Setting.service'
import { type ICreateSetting } from '../../schemas/SettingSchema'
import { type IAuthenticatedRequest } from '../../interfaces/shared'

export const createSetting = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateSetting

    await SettingService.createSetting(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Setting created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
