import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { AppError } from '../../utilities/appError'
import { type IUpdateAddressType } from '../../schemas/AddressSchema'

export const updateAddressToMain = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateAddressType
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await AddressService.updateAddressTypeToMain(userId, payload)
    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Address updated to main successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
