import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { LocalShippingService } from '../../services/LocalShipping.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdateLocalShipping } from '../../schemas/LocalShippingSchema'

export const updateLocalShipping = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateLocalShipping
    await LocalShippingService.update(payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Local shipping updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
