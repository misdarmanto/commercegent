import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ProductService } from '../../services/Product.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUploadHistoriesQuery } from '../../schemas/ProductSchema'

export const uploadHistories = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IUploadHistoriesQuery
    await ProductService.findUploadHistories(payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Upload histories found successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
