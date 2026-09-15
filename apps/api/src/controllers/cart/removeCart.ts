import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CartService } from '../../services/Cart.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { AppError } from '../../utilities/appError'
import { type IRemoveCart } from '../../schemas/CartSchema'

export const removeCart = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IRemoveCart
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await CartService.removeCart(userId, payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Cart removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
