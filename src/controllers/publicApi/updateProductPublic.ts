import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { PublicApiService } from '../../services/PublicApi.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdateProductPublic } from '../../schemas/PublicApiSchema'

export const updateProductPublic = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateProductPublic
    await PublicApiService.updateProductPublic(payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Product public updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
