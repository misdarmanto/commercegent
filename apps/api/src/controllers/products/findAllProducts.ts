import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ProductService } from '../../services/Product.service'
import { type IFindAllProducts } from '../../schemas/productSchema'

export const findAllProducts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllProducts

    const result = await ProductService.findAllProducts(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
