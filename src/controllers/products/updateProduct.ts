import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ProductService } from '../../services/Product.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdateProductBody } from '../../schemas/ProductSchema'

export const updateProduct = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateProductBody

    await ProductService.updateProduct(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Product updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
