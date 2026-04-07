import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CartService } from '../../services/Cart.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { IFindAllCartQuery } from '../../schemas/cartSchema'
import { AppError } from '../../utilities/appError'

export const findAllCart = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllCartQuery
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await CartService.findAllCarts(userId, payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Cart found successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
