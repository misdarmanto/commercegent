import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ShippingService } from '../../services/Shipping.service'
import { IAuthenticatedRequest } from '../../interfaces/shared'
import { type ICreateShippingDraftBody } from '../../schemas/ShippingSchema'
import { AppError } from '../../utilities/appError'

export const createShippingDraft = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateShippingDraftBody
    const userId = req.jwtPayload?.userId
    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await ShippingService.createDraftFromOrder({
      userId,
      orderId: payload.orderId
    })

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Draft created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
