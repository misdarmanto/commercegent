import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { OrderService } from '../../services/Order.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type ICreateOrderBody } from '../../schemas/OrderSchema'
import { AppError } from '../../utilities/appError'

export const createOrder = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateOrderBody
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await OrderService.createOrder(userId, payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Order created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
