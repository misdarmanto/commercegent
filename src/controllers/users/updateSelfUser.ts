import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UserService } from '../../services/User.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdateUser } from '../../schemas/UserSchema'
import { AppError } from '../../utilities/appError'

export const updateSelfUser = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.jwtPayload?.userId
    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const body = req.body as unknown as IUpdateUser
    const result = await UserService.updateSelf(userId, body)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
