import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { SettingService } from '../../services/Setting.service'
import { type IFindSettingQuery } from '../../schemas/SettingSchema'

export const findSetting = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindSettingQuery

    const result = await SettingService.findSettings(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
