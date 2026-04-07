import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UserService } from '../../services/User.service'
import { type IUpdateUserPassword } from '../../schemas/UserSchema'
import { type IAuthenticatedRequest } from '../../interfaces/shared'

export const updateUserPassword = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateUserPassword

    await UserService.updatePassword(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'User password updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
