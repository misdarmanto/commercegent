import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { OrderService } from '../../services/Order.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdateOrder } from '../../schemas/OrderSchema'
import { AppError } from '../../utilities/appError'

export const updateOrder = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateOrder
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await OrderService.updateOrder(userId, payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Order updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
