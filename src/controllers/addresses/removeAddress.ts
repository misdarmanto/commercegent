import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IRemoveAddressQuery } from '../../schemas/AddressSchema'

export const removeAddress = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.query as unknown as IRemoveAddressQuery
    await AddressService.removeAddress(payload.addressId)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Address removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
