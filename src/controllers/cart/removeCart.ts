import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CartService } from '../../services/Cart.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { IRemoveCartQuery } from '../../schemas/cartSchema'
import { AppError } from '../../utilities/appError'

export const removeCart = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const query = req.query as unknown as IRemoveCartQuery
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const result = await CartService.removeCart(userId, query.cartId)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
