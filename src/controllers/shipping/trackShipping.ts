import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ShippingService } from '../../services/Shipping.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type ITrackShipment } from '../../schemas/ShippingSchema'

export const trackShipment = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as ITrackShipment

    const result = await ShippingService.trackShipment(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
