import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IFindDistricts } from '../../schemas/AddressSchema'
import { RegionService } from '../../services/Region.service'

export const findDistricts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.params as unknown as IFindDistricts
    const result = await RegionService.getDistricts(payload.regencyId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
