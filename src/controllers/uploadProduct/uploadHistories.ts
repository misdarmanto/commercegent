import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UploadProductService } from '../../services/UploadProduct.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUploadHistories } from '../../schemas/ProductSchema'

export const uploadHistories = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IUploadHistories
    const result = await UploadProductService.findUploadHistories(payload)

    return res
      .status(StatusCodes.OK)
      .json(
        ResponseData.success({
          data: result,
          message: 'Upload histories found successfully'
        })
      )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
