import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type ICreateAddressBody } from '../../schemas/AddressSchema'
import { AppError } from '../../utilities/appError'

export const createAdminAddress = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateAddressBody
    const userId = req.jwtPayload?.userId
    const userRole = req.jwtPayload?.userRole

    if (userId == null || userRole == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await AddressService.createAdminAddress(userId, userRole, payload)
    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Admin address created successfully' }))
  } catch (error) {
    return handleError(res, error)
  }
}
