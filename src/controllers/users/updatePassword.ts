import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/responseFormater'
import { Op } from 'sequelize'
import { hashPassword } from '../../utilities/scure_password'
import { type UserAttributes, UserModel } from '../../models/user'
import { userUpdatePasswordSchema } from '../../schemas/UserSchema'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'

export const updatePassword = async (req: any, res: Response): Promise<Response> => {
  const { error, value } = validateRequest(userUpdatePasswordSchema, req.body)

  if (error != null) return handleValidationError(res, error)

  const { userPassword, userWhatsAppNumber } = value as UserAttributes

  try {
    const user = await UserModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        userWhatsAppNumber: { [Op.eq]: userWhatsAppNumber },
        userRole: 'user'
      }
    })

    if (user == null) {
      const message = 'User not found!'
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error(message))
    }

    const updatedData: Partial<UserAttributes> = {
      ...(userPassword && { userPassword: hashPassword(userPassword) })
    }

    await UserModel.update(updatedData, {
      where: {
        deleted: { [Op.eq]: 0 },
        userWhatsAppNumber: { [Op.eq]: userWhatsAppNumber }
      }
    })

    const response = ResponseData.success()
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
