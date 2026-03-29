import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AdminService } from '../../services/Admin.service'
import { ILoginAdmin } from '../../schemas/AuthSchema'

export const loginAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as ILoginAdmin
    const result = await AdminService.loginAdmin(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
