import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AdminService } from '../../services/Admin.service'
import { type ICreateAdmin } from '../../schemas/AdminSchema'

export const createAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateAdmin
    await AdminService.createAdmin(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Admin created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
