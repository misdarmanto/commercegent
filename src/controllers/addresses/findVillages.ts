import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IVillagesParams } from '../../schemas/AddressSchema'

export const findVillages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.params as unknown as IVillagesParams
    const result = await AddressService.getVillages(payload.districtId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
