import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ProductService } from '../../services/Product.service'
import { type IFindDetailProduct } from '../../schemas/productSchema'

export const findDetailProduct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IFindDetailProduct

    const result = await ProductService.findDetailProduct(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
