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
import { sequelize } from '../../models'
import { updatePromotionSchema } from '../../schemas/promotionSchema'

export const updatePromotion = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error, value } = validateRequest(updatePromotionSchema, req.body)

  if (error) return handleValidationError(res, error)

  const { products } = value

  const transaction = await sequelize.transaction()

  try {
    for (const item of products) {
      await ProductModel.update(
        { productIsHighlight: item.productIsHighlight },
        {
          where: { productId: item.productId },
          transaction
        }
      )
    }

    await transaction.commit()

    const response = ResponseData.default
    response.data = {
      message: 'Product highlight updated successfully'
    }

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    await transaction.rollback()
    return handleServerError(res, serverError)
  }
}
