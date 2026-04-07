import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ProductService } from '../../services/Product.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IRemoveProductQuery } from '../../schemas/ProductSchema'

export const removeProduct = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IRemoveProductQuery

    await ProductService.removeProduct(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Product removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
