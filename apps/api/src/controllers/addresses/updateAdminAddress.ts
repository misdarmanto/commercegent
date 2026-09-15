import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { AppError } from '../../utilities/appError'
import { type IUpdateAddress } from '../../schemas/AddressSchema'

export const updateAdminAddress = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateAddress
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await AddressService.updateAddress(userId, payload)
    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Admin address created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
