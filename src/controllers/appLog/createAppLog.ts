import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AppLogService } from '../../services/AppLog.service'
import { ICreateAppLog } from '../../schemas/AppLogSchema'

export const createAppLog = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { appLogLevel, appLogMessage, appLogSource, appLogMeta } =
      req.body as ICreateAppLog

    const record = await AppLogService.create({
      appLogLevel,
      appLogMessage,
      appLogSource: appLogSource ?? null,
      appLogMeta: appLogMeta ?? null
    })

    return res.status(StatusCodes.CREATED).json(
      ResponseData.success({
        data: record,
        message: 'AppLog created successfully'
      })
    )
  } catch (error) {
    return handleError(res, error)
  }
}
