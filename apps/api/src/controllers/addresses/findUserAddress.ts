import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { AppError } from '../../utilities/appError'
import { IFindAllAddresses } from '../../schemas/addressSchema'

export const findUserAddress = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.jwtPayload?.userId
    const payload = req.query as unknown as IFindAllAddresses

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const result = await AddressService.findUserAddress(userId, payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
