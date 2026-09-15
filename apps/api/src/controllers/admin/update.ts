import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AdminService } from '../../services/Admin.service'
import { type IUpdateAdmin } from '../../schemas/AdminSchema'
import { AppError } from '../../utilities/appError'
import { type IAuthenticatedRequest } from '../../interfaces/shared'

export const updateAdmin = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateAdmin
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await AdminService.updateAdmin(userId, payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Admin updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
