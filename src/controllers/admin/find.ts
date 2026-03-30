import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AdminService } from '../../services/Admin.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IFindAllUsers } from '../../schemas/UserSchema'
import { type IFindDetailAdmin } from '../../schemas/AdminSchema'

export const findAllAdmin = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllUsers
    const result = await AdminService.findAllAdmins(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}

export const findDetailAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindDetailAdmin
    const result = await AdminService.findDetailAdmin(payload.adminId)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
