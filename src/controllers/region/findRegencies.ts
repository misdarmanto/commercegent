import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { RegionService } from '../../services/Region.service'
import { type IFindRegencies } from '../../schemas/AddressSchema'

export const findRegencies = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.params as unknown as IFindRegencies
    const result = await RegionService.getRegencies(payload.provinceId)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
