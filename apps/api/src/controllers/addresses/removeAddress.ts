import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IRemoveAddress } from '../../schemas/addressSchema'
import { AppError } from '../../utilities/appError'
import { type IAuthenticatedRequest } from '../../interfaces/shared'

export const removeAddress = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IRemoveAddress
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await AddressService.removeAddress(userId, payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Address removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
