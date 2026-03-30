import axios from 'axios'
import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { UserModel, type UserAttributes } from '../models/user'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import redis from '../configs/redis'
import { hashPassword } from '../utilities/scurePassword'
import { generateUniqueId } from '../utilities/generateUniqueId'
import { generateAccessToken } from '../utilities/jwt'
import { appConfigs } from '../configs/appConfig'
import type {
  IFindAllUsers,
  IRequestOtp,
  IUpdateUser,
  IUpdateUserCoinBody,
  IUpdateUserPassword,
  IUserDetailParams,
  IUserLoginBody,
  IUserRegisterBody,
  IVerifyOtp
} from '../schemas/UserSchema'

export class UserService {
  static async login(body: IUserLoginBody) {
    try {
      const user = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userWhatsAppNumber: { [Op.eq]: body.userWhatsAppNumber },
          userRole: 'user'
        }
      })

      if (user == null) {
        throw new AppError(
          'Akun tidak ditemukan. Silahkan melakukan pendaftaran terlebih dahulu!',
          StatusCodes.NOT_FOUND
        )
      }

      if (hashPassword(body.userPassword) !== user.userPassword) {
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
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[UserService] login failed: ${String(error)}`)
      throw new AppError('Gagal login', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async register(body: IUserRegisterBody) {
    try {
      const existing = await UserModel.findOne({
        raw: true,
        where: {
          deleted: { [Op.eq]: 0 },
          [Op.or]: [{ userWhatsAppNumber: { [Op.eq]: body.userWhatsAppNumber } }]
        }
      })

      if (existing != null) {
        throw new AppError(
          `Nomor ${body.userWhatsAppNumber} sudah terdaftar. Silahkan gunakan yang lain.`,
          StatusCodes.BAD_REQUEST
        )
      }

      const payload: Partial<UserAttributes> = {
        userName: body.userName,
        userWhatsAppNumber: body.userWhatsAppNumber,
        userPassword: hashPassword(body.userPassword),
        userGender: body.userGender,
        userRole: 'user',
        deleted: 0,
        userPartnerCode: `${generateUniqueId()}-${body.userWhatsAppNumber}`
      }

      await UserModel.create(payload as UserAttributes)
      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[UserService] register failed: ${String(error)}`)
      throw new AppError('Gagal registrasi', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAllUsers(query: IFindAllUsers) {
    try {
      const page = new Pagination(query.page, query.size)

      const users = await UserModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          ...(Boolean(query.userRole) && { userRole: { [Op.eq]: query.userRole } }),
          ...(query.userRole == null && { userRole: { [Op.eq]: 'user' } }),
          ...(Boolean(query.search) && {
            [Op.or]: [
              { userName: { [Op.like]: `%${query.search}%` } },
              { userEmail: { [Op.like]: `%${query.search}%` } },
              { userPartnerCode: { [Op.like]: `%${query.search}%` } }
            ]
          })
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
        ],
        order: [['userId', 'desc']],
        ...(query.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(users)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[UserService] findAllUsers failed: ${String(error)}`)
      throw new AppError('Gagal mengambil daftar user', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findDetailUser(params: IUserDetailParams) {
    try {
      const user = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userId: { [Op.eq]: params.userId }
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

      if (user == null) {
        throw new AppError('user not found!', StatusCodes.NOT_FOUND)
      }

      return user
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[UserService] findDetailUser failed: ${String(error)}`)
      throw new AppError('Gagal mengambil detail user', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateSelf(userId: number, body: IUpdateUser) {
    try {
      const user = await UserModel.findOne({
        where: { deleted: { [Op.eq]: 0 }, userId: { [Op.eq]: userId } }
      })

      if (user == null) {
        throw new AppError('user not found!', StatusCodes.NOT_FOUND)
      }

      const newData: Partial<UserAttributes> = {
        ...(body.userName != null &&
          body.userName.length > 0 && { userName: body.userName }),
        ...(body.userPassword != null &&
          body.userPassword.length > 0 && {
            userPassword: hashPassword(body.userPassword)
          }),
        ...(body.userWhatsAppNumber != null &&
          body.userWhatsAppNumber.length > 0 && {
            userWhatsAppNumber: body.userWhatsAppNumber
          }),
        ...(body.userPhoto != null &&
          body.userPhoto.length > 0 && { userPhoto: body.userPhoto }),
        ...(typeof body.userCoin === 'number' &&
          body.userCoin >= 0 && { userCoin: body.userCoin }),
        ...(body.userRole != null &&
          body.userRole.length > 0 && { userRole: body.userRole })
      }

      await user.update(newData)
      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[UserService] updateSelf failed: ${String(error)}`)
      throw new AppError('Gagal memperbarui user', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeUser(userId: number) {
    try {
      const user = await UserModel.findOne({
        where: { deleted: { [Op.eq]: 0 }, userId: { [Op.eq]: userId } }
      })

      if (user == null) {
        throw new AppError('user not found!', StatusCodes.NOT_FOUND)
      }

      user.deleted = 1
      await user.save()
      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[UserService] removeUser failed: ${String(error)}`)
      throw new AppError('Gagal menghapus user', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateUserCoin(body: IUpdateUserCoinBody) {
    try {
      const user = await UserModel.findOne({
        where: { deleted: { [Op.eq]: 0 }, userId: { [Op.eq]: body.userId } }
      })

      if (user == null) {
        throw new AppError('user not found!', StatusCodes.NOT_FOUND)
      }

      user.userCoin = body.userCoin
      await user.save()
      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[UserService] updateUserCoin failed: ${String(error)}`)
      throw new AppError('Gagal update coin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updatePassword(body: IUpdateUserPassword) {
    try {
      const user = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userWhatsAppNumber: { [Op.eq]: body.userWhatsAppNumber },
          userRole: 'user'
        }
      })

      if (user == null) {
        throw new AppError('User not found!', StatusCodes.NOT_FOUND)
      }

      await user.update({ userPassword: hashPassword(body.userPassword) })
      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[UserService] updatePassword failed: ${String(error)}`)
      throw new AppError('Gagal update password', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async requestOtp(body: IRequestOtp) {
    try {
      const existingUser = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userWhatsAppNumber: { [Op.eq]: body.whatsappNumber }
        }
      })

      if (body.otpType === 'resetPassword' && existingUser === null) {
        throw new AppError(
          `whatsapp number ${body.whatsappNumber} is not registered.`,
          StatusCodes.BAD_REQUEST
        )
      }

      if (body.otpType === 'register' && existingUser !== null) {
        throw new AppError(
          `whatsapp number ${body.whatsappNumber} is already registered.`,
          StatusCodes.BAD_REQUEST
        )
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const seconds = 5 * 60
      await redis.setex(`otp:${otpCode}`, seconds, otpCode)

      const message = encodeURIComponent(
        `*${otpCode}* adalah kode verifikasi Anda.\n\n` +
          'Pengingat keamanan: Untuk memastikan keamanan akun Anda, mohon jangan bagikan informasi apa pun tentang akun Anda kepada siapa pun.'
      )

      const wablasResponse = await axios.get(
        `${appConfigs.wablas.url}/send-message?phone=${body.whatsappNumber}&message=${message}&token=${appConfigs.wablas.apiKey}`
      )

      if (wablasResponse.status !== 200) {
        throw new AppError('Failed to send OTP', StatusCodes.BAD_GATEWAY)
      }

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[UserService] requestOtp failed: ${String(error)}`)
      throw new AppError('Gagal request OTP', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async verifyOtp(body: IVerifyOtp) {
    try {
      const storedOtp = await redis.get(`otp:${body.otpCode}`)

      if (!storedOtp || storedOtp !== body.otpCode) {
        throw new AppError('Invalid or expired OTP!', StatusCodes.UNAUTHORIZED)
      }

      await redis.del(`otp:${body.otpCode}`)
      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[UserService] verifyOtp failed: ${String(error)}`)
      throw new AppError('Gagal verifikasi OTP', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
