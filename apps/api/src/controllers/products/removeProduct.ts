import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ProductService } from '../../services/Product.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IRemoveProduct } from '../../schemas/productSchema'

export const removeProduct = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IRemoveProduct

    const result = await ProductService.removeProduct(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ data: result, message: 'Product removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
