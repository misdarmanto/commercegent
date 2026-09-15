import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { LocalShippingService } from '../../services/LocalShipping.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IRemoveLocalShipping } from '../../schemas/LocalShippingSchema'

export const removeLocalShipping = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IRemoveLocalShipping
    await LocalShippingService.remove(payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Local shipping removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
