import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IRegenciesParams } from '../../schemas/AddressSchema'

export const findRegencies = async (req: Request, res: Response): Promise<Response> => {
  try {
    const params = req.params as unknown as IRegenciesParams
    const regencies = await AddressService.getRegencies(params.provinceId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: regencies }))
  } catch (error) {
    return handleError(res, error)
  }
}
