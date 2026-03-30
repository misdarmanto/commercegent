import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UserService } from '../../services/User.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IFindAllUsers } from '../../schemas/UserSchema'
import { AppError } from '../../utilities/appError'

export const findAllUsers = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (req.jwtPayload?.userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const query = req.query as unknown as IFindAllUsers
    const result = await UserService.findAllUsers(query)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
