import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'

export const mainController = async (req: Request, res: Response): Promise<any> => {
  try {
    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        data: { aboutMe: 'Welcome to FRESH E-COMMERCE API sV1' },
        message: 'Welcome to FRESH E-COMMERCE API sV1'
      })
    )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}

export const healthCheckController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        data: { status: 'ok', uptime: process.uptime() },
        message: 'Health check successful'
      })
    )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
