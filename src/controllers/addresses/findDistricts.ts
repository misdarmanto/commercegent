import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IDistrictsParams } from '../../schemas/AddressSchema'

export const findDistricts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const params = req.params as unknown as IDistrictsParams
    const districts = await AddressService.getDistricts(params.regencyId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: districts }))
  } catch (error) {
    return handleError(res, error)
  }
}
