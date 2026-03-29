import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

export const mainController = async (req: Request, res: Response): Promise<any> => {
  try {
    const data = {
      about_me: 'Welcome to LEORA E-COMMERCE API sV1'
    }
    const response = ResponseData.default
    response.data = data
    return res.status(StatusCodes.OK).json(response)
  } catch (error: any) {
    const response = ResponseData.error(
      `unable to process request! error ${error.message}`
    )
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response)
  }
}

export const healthCheckController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const response = ResponseData.default
    response.data = { status: 'ok', uptime: process.uptime() }
    return res.status(StatusCodes.OK).json(response)
  } catch (error: any) {
    const response = ResponseData.error(`Health check failed: ${error.message}`)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response)
  }
}
