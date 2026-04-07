import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UserService } from '../../services/User.service'
import { type IUserLoginBody } from '../../schemas/UserSchema'

export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUserLoginBody
    const result = await UserService.login(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
