import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AdminService } from '../../services/Admin.service'
import { type IUpdateAdmin } from '../../schemas/AdminSchema'

export const updateAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateAdmin
    await AdminService.updateAdmin(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Admin updated successfully' }))
  } catch (error) {
    return handleError(res, error)
  }
}
