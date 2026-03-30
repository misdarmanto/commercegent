import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AddressService } from '../../services/Address.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'

export const findAdminAddress = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const result = await AddressService.findAdminAddress(req.jwtPayload?.userRole)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
