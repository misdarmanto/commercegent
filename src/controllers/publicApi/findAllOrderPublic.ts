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
    const result = await PublicApiService.findAllOrdersPublic(
      req.query as unknown as IFindAllOrderPublicQuery
    )
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
