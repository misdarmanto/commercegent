import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { OrderService } from '../../services/Order.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IFindAllOrder } from '../../schemas/orderSchema'
import { AppError } from '../../utilities/appError'

export const findAllOrder = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllOrder
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const result = await OrderService.findAllOrders(
      userId,
      payload,
      req.jwtPayload?.userRole
    )
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
