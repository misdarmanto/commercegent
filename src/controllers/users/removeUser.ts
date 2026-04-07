import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UserService } from '../../services/User.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { IRemoveUserQuery } from '../../schemas/UserSchema'

export const removeUser = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IRemoveUserQuery

    await UserService.removeUser(payload.userId)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'User removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
