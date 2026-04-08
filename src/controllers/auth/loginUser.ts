import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AuthService } from '../../services/Auth.service'
import { type ILoginUser } from '../../schemas/UserSchema'

export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as ILoginUser

    const result = await AuthService.userLogin(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
