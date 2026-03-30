import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ShippingService } from '../../services/ShippingService'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type ITrackShipmentQuery } from '../../schemas/ShippingSchema'
import { AppError } from '../../utilities/appError'

export const trackShipment = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.jwtPayload?.userId
    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const query = req.query as unknown as ITrackShipmentQuery
    const result = await ShippingService.trackShipment(userId, query.orderId)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
