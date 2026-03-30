import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UserService } from '../../services/User.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdateUserCoinBody } from '../../schemas/UserSchema'
import { AppError } from '../../utilities/appError'

export const updateUserCoin = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (req.jwtPayload?.userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const body = req.body as unknown as IUpdateUserCoinBody
    const result = await UserService.updateUserCoin(body)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
