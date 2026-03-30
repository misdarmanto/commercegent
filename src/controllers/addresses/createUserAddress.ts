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
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const payload = req.body as unknown as ICreateAddressBody
    const result = await AddressService.createUserAddress(userId, payload)

    const status =
      result.message === 'User address updated' ? StatusCodes.OK : StatusCodes.CREATED

    return res.status(status).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
