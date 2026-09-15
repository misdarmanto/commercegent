import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AuthService } from '../../services/Auth.service'
import { ILoginAdmin } from '../../schemas/AuthSchema'

export const loginAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as ILoginAdmin
    const result = await AuthService.loginAdmin(payload)

    return res
      .status(StatusCodes.OK)
      .json(
        ResponseData.success({ data: result, message: 'Admin logged in successfully' })
      )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
