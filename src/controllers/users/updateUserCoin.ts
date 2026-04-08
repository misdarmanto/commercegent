import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UserService } from '../../services/User.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdateUserCoin } from '../../schemas/UserSchema'
import { AppError } from '../../utilities/appError'

export const updateUserCoin = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateUserCoin
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await UserService.updateUserCoin(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'User coin updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
