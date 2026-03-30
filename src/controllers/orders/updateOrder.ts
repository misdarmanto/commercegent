import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { OrderService } from '../../services/Order.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdateOrderBody } from '../../schemas/OrderSchema'
import { AppError } from '../../utilities/appError'

export const updateOrder = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const body = req.body as unknown as IUpdateOrderBody
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const result = await OrderService.updateOrder(userId, body)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
