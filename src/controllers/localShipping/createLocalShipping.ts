import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { LocalShippingService } from '../../services/LocalShipping.service'
import { type ICreateLocalShipping } from '../../schemas/LocalShippingSchema'
import { type IAuthenticatedRequest } from '../../interfaces/shared'

export const createLocalShipping = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateLocalShipping
    await LocalShippingService.create(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Local shipping created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
