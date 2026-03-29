import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { MyProfileService } from '../../services/MyProfile.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdateMyProfileBody } from '../../schemas/MyProfileSchema'
import { AppError } from '../../utilities/appError'

export const updateMyProfile = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.jwtPayload?.userId

    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const payload = req.body as unknown as IUpdateMyProfileBody
    const result = await MyProfileService.updateMyProfile(userId, payload)

    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        data: result,
        message: 'Profile updated successfully'
      })
    )
  } catch (error) {
    return handleError(res, error)
  }
}
