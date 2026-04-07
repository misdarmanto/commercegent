import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ProductService } from '../../services/Product.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type ICreateProductBody } from '../../schemas/ProductSchema'

export const createProduct = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateProductBody
    await ProductService.createProduct(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Product created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
