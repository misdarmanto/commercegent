import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { UserModel, type UserAttributes } from '../models/UserModel'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { hashPassword } from '../utilities/scurePassword'
import { generateUniqueId } from '../utilities/generateUniqueId'
import { generateAccessToken } from '../utilities/jwt'
import type { ILoginUser, ISignupUser } from '../schemas/UserSchema'
import { ILoginAdmin } from '../schemas/AuthSchema'

export class AuthService {
  static async userLogin(payload: ILoginUser) {
    try {
      const user = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          userWhatsAppNumber: { [Op.eq]: payload.userWhatsAppNumber },
          userRole: 'user'
        }
      })

      if (user == null) {
        throw new AppError(
          'Akun tidak ditemukan. Silahkan melakukan pendaftaran terlebih dahulu!',
          StatusCodes.NOT_FOUND
        )
      }

      if (hashPassword(payload.userPassword) !== user.userPassword) {
        throw new AppError(
          'kombinasi nomor whatsapp dan password tidak ditemukan!',
          StatusCodes.UNAUTHORIZED
        )
      }

      const token = generateAccessToken({
        userId: user.userId,
        userRole: user.userRole
      })

      return { token }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AuthService] userLogin failed: ${String(serviceError)}`)
      throw new AppError('Failed to login', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async userSignup(payload: ISignupUser) {
    try {
      const existing = await UserModel.findOne({
        raw: true,
        where: {
          deleted: { [Op.eq]: false },
          [Op.or]: [{ userWhatsAppNumber: { [Op.eq]: payload.userWhatsAppNumber } }]
        }
      })

      if (existing != null) {
        throw new AppError(
          `Nomor ${payload.userWhatsAppNumber} sudah terdaftar. Silahkan gunakan yang lain.`,
          StatusCodes.BAD_REQUEST
        )
      }

      const createPayload = {
        userName: payload.userName,
        userWhatsAppNumber: payload.userWhatsAppNumber,
        userPassword: hashPassword(payload.userPassword),
        userGender: payload.userGender,
        userRole: 'user',
        deleted: false,
        userPartnerCode: `${generateUniqueId()}-${payload.userWhatsAppNumber}`
      } as unknown as UserAttributes

      await UserModel.create(createPayload)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AuthService] userSignup failed: ${String(serviceError)}`)
      throw new AppError('Failed to register', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async loginAdmin(payload: ILoginAdmin) {
    try {
      const user = await UserModel.findOne({
        raw: true,
        where: {
          deleted: { [Op.eq]: false },
          userWhatsAppNumber: { [Op.eq]: payload.adminWhatsAppNumber },
          [Op.or]: [
            { userRole: { [Op.eq]: 'admin' } },
            { userRole: { [Op.eq]: 'superAdmin' } }
          ]
        }
      })

      if (user == null) {
        throw new AppError(
          'Akun tidak ditemukan. Silahkan lakukan pendaftaran terlebih dahulu sebagai admin!',
          StatusCodes.NOT_FOUND
        )
      }

      if (hashPassword(payload.adminPassword) !== user.userPassword) {
        throw new AppError(
          'kombinasi nomor wa dan password tidak ditemukan!',
          StatusCodes.UNAUTHORIZED
        )
      }

      const token = generateAccessToken({
        userId: user.userId,
        userRole: user.userRole
      })

      return { token }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AuthService] adminLogin failed: ${String(serviceError)}`)
      throw new AppError('Failed to login admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
