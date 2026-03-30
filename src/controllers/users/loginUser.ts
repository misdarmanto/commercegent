import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UserService } from '../../services/User.service'
import { type IUserLoginBody } from '../../schemas/UserSchema'

export const loginUser = async (req: unknown, res: Response): Promise<Response> => {
  try {
    const body = (req as { body: IUserLoginBody }).body
    const result = await UserService.login(body)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
