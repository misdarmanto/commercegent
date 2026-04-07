import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AdminService } from '../../services/Admin.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IFindAllAdmins, type IFindDetailAdmin } from '../../schemas/AdminSchema'
import { AppError } from '../../utilities/appError'

export const findAllAdmin = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllAdmins
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const result = await AdminService.findAllAdmins(userId, payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}

export const findDetailAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindDetailAdmin
    const result = await AdminService.findDetailAdmin(payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
