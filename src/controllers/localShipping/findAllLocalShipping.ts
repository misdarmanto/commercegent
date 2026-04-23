import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { LocalShippingService } from '../../services/LocalShipping.service'
import { type IFindAllLocalShipping } from '../../schemas/LocalShippingSchema'

export const findAllLocalShipping = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllLocalShipping
    const result = await LocalShippingService.findAll(payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
