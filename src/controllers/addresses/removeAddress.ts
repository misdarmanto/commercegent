import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IRemoveAddressQuery } from '../../schemas/AddressSchema'

export const removeAddress = async (req: Request, res: Response): Promise<Response> => {
  try {
    const query = req.query as unknown as IRemoveAddressQuery
    const result = await AddressService.removeAddress(query.addressId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
