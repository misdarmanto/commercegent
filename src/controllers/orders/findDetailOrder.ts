import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { OrderService } from '../../services/Order.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IOrderDetailParams } from '../../schemas/OrderSchema'

export const findDetailOrder = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IOrderDetailParams

    const result = await OrderService.findDetailOrder(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
