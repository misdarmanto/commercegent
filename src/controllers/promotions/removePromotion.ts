import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { ProductModel } from '../../models/products'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { removePromotionSchema } from '../../schemas/promotionSchema'

export const removePromotion = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  console.log(req.query)
  const { error, value } = validateRequest(removePromotionSchema, req.query)

  if (error) return handleValidationError(res, error)

  try {
    const { productId } = value

    await ProductModel.update({ productIsHighlight: false }, { where: { productId } })

    const response = ResponseData.default
    response.data = { message: 'Product promotion removed successfully' }

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
