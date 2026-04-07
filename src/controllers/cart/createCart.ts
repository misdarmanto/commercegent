import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CartService } from '../../services/Cart.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { AppError } from '../../utilities/appError'
import { type ICreateCart } from '../../schemas/CartSchema'

export const createCart = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateCart
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await CartService.createCart(userId, payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Cart created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
