import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IFindDistricts } from '../../schemas/AddressSchema'

export const findDistricts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.params as unknown as IFindDistricts
    const result = await AddressService.getDistricts(payload.regencyId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
