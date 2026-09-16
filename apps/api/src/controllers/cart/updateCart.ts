import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CartService } from '../../services/Cart.service'
import { type IUpdateCart } from '../../schemas/cartSchema'
import { AppError } from '../../utilities/appError'
import { type IAuthenticatedRequest } from '../../interfaces/shared'

export const updateCart = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateCart
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await CartService.updateCart(userId, payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Cart updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
