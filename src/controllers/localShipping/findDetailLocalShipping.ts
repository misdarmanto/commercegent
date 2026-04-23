import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { LocalShippingService } from '../../services/LocalShipping.service'
import { type IDetailLocalShipping } from '../../schemas/LocalShippingSchema'

export const findDetailLocalShipping = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IDetailLocalShipping
    const result = await LocalShippingService.findDetail(payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
