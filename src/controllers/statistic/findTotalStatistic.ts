import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { StatisticService } from '../../services/Statistic.service'

export const findTotalStatistic = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await StatisticService.findTotal()
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
