import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ShippingService } from '../../services/Shipping.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { AppError } from '../../utilities/appError'
import { type IConfirmDraftOrder } from '../../schemas/ShippingSchema'

export const confirmDraftOrder = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IConfirmDraftOrder
    const userId = req.jwtPayload?.userId
    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await ShippingService.confirmDraftOrder(userId, payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Draft order confirmed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
