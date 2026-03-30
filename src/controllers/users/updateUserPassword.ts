import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UserService } from '../../services/User.service'
import { type IUpdateUserPassword } from '../../schemas/UserSchema'

export const updateUserPassword = async (
  req: unknown,
  res: Response
): Promise<Response> => {
  try {
    const body = (req as { body: IUpdateUserPassword }).body
    const result = await UserService.updatePassword(body)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
