import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type ICreateAddressBody } from '../../schemas/AddressSchema'
import { AppError } from '../../utilities/appError'

export const createUserAddress = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateAddressBody
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await AddressService.createUserAddress(userId, payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'User address created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
