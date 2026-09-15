import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { ShippingService } from '../../services/Shipping.service'
import { IAuthenticatedRequest } from '../../interfaces/shared'
import { type ICreateShippingDraft } from '../../schemas/ShippingSchema'

export const createShippingDraft = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateShippingDraft

    await ShippingService.createDraftFromOrder(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Draft created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
