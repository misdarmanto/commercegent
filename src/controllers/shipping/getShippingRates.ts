import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { AppError } from '../../utilities/appError'
import { ShippingService } from '../../services/ShippingService'
import { type IGetShippingRatesBody } from '../../schemas/ShippingSchema'

export const getShippingRates = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.jwtPayload?.userId
    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const items = req.body as unknown as IGetShippingRatesBody
    const result = await ShippingService.getShippingRates(userId, items)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
