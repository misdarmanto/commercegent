import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { CartsModel } from '../../models/carts'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { createCartSchema } from '../../schemas/cartSchema'
import { IAuthenticatedRequest } from '../../interfaces/shared'

export const createCart = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error: validationError, value: validatedData } = validateRequest(
    createCartSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const existingCart = await CartsModel.findOne({
      where: {
        deleted: 0,
        cartUserId: req.jwtPayload?.userId,
        cartProductId: validatedData.cartProductId
      }
    })

    if (existingCart) {
      existingCart.cartTotalItem += validatedData.cartTotalItem
      await existingCart.save()
    } else {
      await CartsModel.create({
        ...validatedData,
        cartUserId: req.jwtPayload!.userId,
        deleted: 0
      })
    }

    const response = ResponseData.default
    const result = { message: 'success' }
    response.data = result
    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
