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
    const query = req.query as unknown as IRemoveProductQuery
    const result = await ProductService.removeProduct(query)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
