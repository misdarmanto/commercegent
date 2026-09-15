import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { UserModel } from '../models/UserModel'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import redis from '../configs/redis'
import { WablasAPIService } from './external/WablasApi.service'
import type { IRequestOtp, IVerifyOtp } from '../schemas/UserSchema'

export class OtpService {
  static async requestOtp(payload: IRequestOtp) {
    try {
      const existingUser = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          userWhatsAppNumber: { [Op.eq]: payload.whatsappNumber }
        }
      })

      if (payload.otpType === 'resetPassword' && existingUser === null) {
        throw new AppError(
          `whatsapp number ${payload.whatsappNumber} is not registered.`,
          StatusCodes.BAD_REQUEST
        )
      }

      if (payload.otpType === 'register' && existingUser !== null) {
        throw new AppError(
          `whatsapp number ${payload.whatsappNumber} is already registered.`,
          StatusCodes.BAD_REQUEST
        )
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const seconds = 5 * 60
      await redis.setex(`otp:${otpCode}`, seconds, otpCode)

      const message =
        `*${otpCode}* adalah kode verifikasi Anda.\n\n` +
        'Pengingat keamanan: Untuk memastikan keamanan akun Anda, mohon jangan bagikan informasi apa pun tentang akun Anda kepada siapa pun.'

      await WablasAPIService.sendMessage({
        phone: payload.whatsappNumber,
        message
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[OtpService] requestOtp failed: ${String(serviceError)}`)
      throw new AppError('Failed to request OTP', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async verifyOtp(payload: IVerifyOtp) {
    try {
      const storedOtp = await redis.get(`otp:${payload.otpCode}`)

      if (!storedOtp || storedOtp !== payload.otpCode) {
        throw new AppError('Invalid or expired OTP!', StatusCodes.BAD_REQUEST)
      }

      await redis.del(`otp:${payload.otpCode}`)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[OtpService] verifyOtp failed: ${String(serviceError)}`)
      throw new AppError('Failed to verify OTP', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
