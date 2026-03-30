import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ShippingService } from '../../services/ShippingService'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IConfirmDraftOrderBody } from '../../schemas/ShippingSchema'
import { AppError } from '../../utilities/appError'

export const confirmDraftOrder = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.jwtPayload?.userId
    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const body = req.body as unknown as IConfirmDraftOrderBody
    const result = await ShippingService.confirmDraftOrder(userId, body.orderId)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
