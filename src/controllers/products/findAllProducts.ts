import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ProductService } from '../../services/Product.service'
import { type IFindAllProductsQuery } from '../../schemas/ProductSchema'

export const findAllProducts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await ProductService.findAllProducts(
      req.query as unknown as IFindAllProductsQuery
    )
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
