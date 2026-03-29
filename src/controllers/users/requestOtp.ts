import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'
import axios from 'axios'
import { ResponseData } from '../../utilities/response'
import { UserModel } from '../../models/user'
import redis from '../../configs/redis'
import { requestOtpSchema } from '../../schemas/UserSchema'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { SettingModel } from '../../models/settings'
import { appConfigs } from '../../configs/appConfig'

interface IotpType {
  whatsappNumber: string
  otpType: 'register' | 'resetPassword'
}

export const requestOtp = async (req: any, res: Response): Promise<Response> => {
  const { error } = validateRequest(requestOtpSchema, req.body)

  if (error != null) return handleValidationError(res, error)

  const requestBody = req.body as IotpType

  try {
    const existingUser = await UserModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        userWhatsAppNumber: { [Op.eq]: requestBody.whatsappNumber }
      }
    })

    if (requestBody.otpType === 'resetPassword' && existingUser === null) {
      const message = `whatsapp number ${requestBody.whatsappNumber} is not registered.`
      return res.status(StatusCodes.BAD_REQUEST).json(ResponseData.error(message))
    }

    if (requestBody.otpType === 'register' && existingUser !== null) {
      const message = `whatsapp number ${requestBody.whatsappNumber} is already registered.`
      return res.status(StatusCodes.BAD_REQUEST).json(ResponseData.error(message))
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const minutes = 5 * 60
    await redis.setex(`otp:${otpCode}`, minutes, otpCode)

    const message = encodeURIComponent(
      `*${otpCode}* adalah kode verifikasi Anda.\n\n` +
        'Pengingat keamanan: Untuk memastikan keamanan akun Anda, mohon jangan bagikan informasi apa pun tentang akun Anda kepada siapa pun.'
    )

    const wablasResponse = await axios.get(
      `${appConfigs.wablas.url}/send-message?phone=${requestBody.whatsappNumber}&message=${message}&token=${appConfigs.wablas.apiKey}`
    )

    if (wablasResponse.status !== 200) {
      throw new Error('Failed to send OTP')
    }

    const response = ResponseData.default

    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
