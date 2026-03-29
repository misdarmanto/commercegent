import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { requestChecker } from '../../utilities/requestCheker'
import { CartsModel, type CartsAttributes } from '../../models/carts'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { removeCartSchema } from '../../schemas/cartSchema'
import { IAuthenticatedRequest } from '../../interfaces/shared'

export const removeCart = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error: validationError, value: validatedData } = validateRequest(
    removeCartSchema,
    req.query
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const result = await CartsModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        cartId: { [Op.eq]: validatedData.cartId },
        cartUserId: { [Op.eq]: req.jwtPayload?.userId }
      }
    })

    if (result == null) {
      const message = 'cart not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    result.deleted = 1
    void result.save()

    const response = ResponseData.default
    response.data = { message: 'success' }
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
