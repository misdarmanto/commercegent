import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { SettingService } from '../../services/Setting.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdateSettingBody } from '../../schemas/SettingSchema'

export const updateSetting = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateSettingBody

    await SettingService.updateSetting(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Setting updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
