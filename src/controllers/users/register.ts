import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'
import { ResponseData } from '../../utilities/response'
import { type UserAttributes, UserModel } from '../../models/user'
import { requestChecker } from '../../utilities/requestCheker'
import { hashPassword } from '../../utilities/scure_password'
import { generateUniqueId } from '../../utilities/generateUniqueId'
import { handleServerError } from '../../utilities/requestHandler'

export const userRegister = async (req: any, res: Response): Promise<any> => {
  const requestBody = req.body as UserAttributes

  const emptyField = requestChecker({
    requireList: ['userName', 'userPassword', 'userWhatsAppNumber', 'userGender'],
    requestData: requestBody
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    const user = await UserModel.findOne({
      raw: true,
      where: {
        deleted: { [Op.eq]: 0 },
        [Op.or]: [{ userWhatsAppNumber: { [Op.eq]: requestBody.userWhatsAppNumber } }]
      }
    })

    if (user != null) {
      const message = `Nomor ${requestBody.userWhatsAppNumber} sudah terdaftar. Silahkan gunakan yang lain.`

      const response = ResponseData.error(message)
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    requestBody.userPassword = hashPassword(requestBody.userPassword)
    requestBody.userPartnerCode =
      generateUniqueId() + '-' + requestBody.userWhatsAppNumber
    await UserModel.create(requestBody)

    const response = ResponseData.default
    response.data = { message: 'success' }
    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
