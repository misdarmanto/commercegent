import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { StatisticService } from '../../services/Statistic.service'
import { type ICreateVisitor } from '../../schemas/StatisticSchema'

export const createVisitor = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateVisitor
    await StatisticService.createVisitor(payload)
    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Visitor created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
