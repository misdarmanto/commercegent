import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AppLogService } from '../../services/AppLog.service'
import { ICreateAppLog } from '../../schemas/AppLogSchema'

export const createAppLog = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateAppLog
    const result = await AppLogService.create(payload)
    return res.status(StatusCodes.CREATED).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
