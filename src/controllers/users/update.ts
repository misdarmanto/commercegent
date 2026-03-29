import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { UserModel, type UserAttributes } from '../../models/user'
import { handleServerError } from '../../utilities/requestHandler'

export const updateUser = async (req: any, res: Response): Promise<any> => {
  const requestBody = req.body as UserAttributes

  try {
    const result = await UserModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        userId: { [Op.eq]: req.body?.user?.userId }
      }
    })

    if (result == null) {
      const message = 'user not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    const newData: UserAttributes | any = {
      ...(requestBody?.userName?.length > 0 && {
        userName: requestBody?.userName
      }),
      ...(requestBody?.userPassword?.length > 0 && {
        userPassword: requestBody?.userPassword
      }),
      ...(requestBody?.userWhatsAppNumber?.length > 0 && {
        userWhatsAppNumber: requestBody?.userWhatsAppNumber
      }),
      ...(requestBody?.userPhoto?.length > 0 && {
        userPhoto: requestBody?.userPhoto
      }),
      ...(requestBody?.userCoin > 0 && {
        userCoin: requestBody?.userCoin
      }),
      ...(requestBody?.userRole?.length > 0 && {
        userRole: requestBody?.userRole
      })
    }

    await UserModel.update(newData, {
      where: {
        deleted: { [Op.eq]: 0 },
        userId: { [Op.eq]: req.body?.user?.userId }
      }
    })

    const response = ResponseData.default
    response.data = { message: 'success' }
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
