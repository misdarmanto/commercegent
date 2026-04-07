import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { PublicApiService } from '../../services/PublicApi.service'
import { type IFindAllOrderPublicQuery } from '../../schemas/PublicApiSchema'

export const findAllOrderPublic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllOrderPublicQuery
    const result = await PublicApiService.findAllOrdersPublic(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
