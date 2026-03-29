import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { UserModel } from '../../models/user'
import { handleServerError } from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared'

export const findMyProfile = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const resul = await UserModel.findOne({
      where: {
        deleted: 0,
        userId: req.jwtPayload?.userId
      },
      attributes: [
        'userId',
        'userName',
        'userWhatsAppNumber',
        'userCoin',
        'userRole',
        'userPartnerCode',
        'createdAt',
        'updatedAt'
      ]
    })

    if (resul == null) {
      const message = 'user not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    const response = ResponseData.default
    response.data = resul
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
