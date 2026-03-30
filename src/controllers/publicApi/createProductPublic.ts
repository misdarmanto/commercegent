import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { PublicApiService } from '../../services/PublicApi.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type ICreateProductPublicBody } from '../../schemas/PublicApiSchema'

export const createProductPublic = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateProductPublicBody
    const result = await PublicApiService.createProductPublic(payload)
    return res.status(StatusCodes.CREATED).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
