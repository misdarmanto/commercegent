import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ProductService } from '../../services/Product.service'
import { type IProductDetailParams } from '../../schemas/ProductSchema'

export const findDetailProduct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await ProductService.findDetailProduct(
      req.params as unknown as IProductDetailParams
    )
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
