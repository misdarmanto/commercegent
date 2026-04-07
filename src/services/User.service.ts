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
  IUpdateUserCoin,
  IUpdateUserPassword,
  IFindDetailUser,
  ILoginUser,
  IVerifyOtp,
  IRemoveUser,
  ISignupUser
} from '../schemas/UserSchema'

export class UserService {
  static async login(payload: ILoginUser) {
    try {
      const user = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
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
      logger.error(`[UserService] login failed: ${String(serviceError)}`)
      throw new AppError('Failed to login', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async signup(userId: number, payload: ISignupUser) {
    try {
      const existing = await UserModel.findOne({
        raw: true,
        where: {
          deleted: { [Op.eq]: 0 },
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
        deleted: 0,
        userPartnerCode: `${generateUniqueId()}-${payload.userWhatsAppNumber}`,
        userId: userId
      } as unknown as UserAttributes

      await UserModel.create(createPayload)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[UserService] register failed: ${String(serviceError)}`)
      throw new AppError('Failed to register', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAllUsers(payload: IFindAllUsers) {
    try {
      const page = new Pagination(payload.page, payload.size)

      const users = await UserModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          ...(Boolean(payload.userRole) && { userRole: { [Op.eq]: payload.userRole } }),
          ...(payload.userRole == null && { userRole: { [Op.eq]: 'user' } }),
          ...(Boolean(payload.search) && {
            [Op.or]: [
              { userName: { [Op.like]: `%${payload.search}%` } },
              { userEmail: { [Op.like]: `%${payload.search}%` } },
              { userPartnerCode: { [Op.like]: `%${payload.search}%` } }
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
        ...(payload.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(users)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[UserService] findAllUsers failed: ${String(serviceError)}`)
      throw new AppError('Failed to find all users', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findDetailUser(payload: IFindDetailUser) {
    try {
      const user = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userId: { [Op.eq]: payload.userId }
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
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[UserService] findDetailUser failed: ${String(serviceError)}`)
      throw new AppError('Failed to find detail user', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateSelf(userId: number, payload: IUpdateUser) {
    try {
      const user = await UserModel.findOne({
        where: { deleted: 0, userId }
      })

      if (user == null) {
        throw new AppError('User not found!', StatusCodes.NOT_FOUND)
      }

      const newData: Partial<UserAttributes> = {
        ...(payload.userName != null &&
          payload.userName.length > 0 && { userName: payload.userName }),
        ...(payload.userPassword != null &&
          payload.userPassword.length > 0 && {
            userPassword: hashPassword(payload.userPassword)
          }),
        ...(payload.userWhatsAppNumber != null &&
          payload.userWhatsAppNumber.length > 0 && {
            userWhatsAppNumber: payload.userWhatsAppNumber
          }),
        ...(payload.userPhoto != null &&
          payload.userPhoto.length > 0 && { userPhoto: payload.userPhoto }),
        ...(typeof payload.userCoin === 'number' &&
          payload.userCoin >= 0 && { userCoin: payload.userCoin }),
        ...(payload.userRole != null &&
          payload.userRole.length > 0 && { userRole: payload.userRole })
      }

      await user.update(newData)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[UserService] updateSelf failed: ${String(serviceError)}`)
      throw new AppError('Failed to update self', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeUser(payload: IRemoveUser) {
    try {
      const user = await UserModel.findOne({
        where: { deleted: { [Op.eq]: 0 }, userId: { [Op.eq]: payload.userId } }
      })

      if (user == null) {
        throw new AppError('user not found!', StatusCodes.NOT_FOUND)
      }

      user.deleted = 1
      await user.save()
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[UserService] removeUser failed: ${String(serviceError)}`)
      throw new AppError('Failed to remove user', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateUserCoin(payload: IUpdateUserCoin) {
    try {
      const user = await UserModel.findOne({
        where: { deleted: { [Op.eq]: 0 }, userId: { [Op.eq]: payload.userId } }
      })

      if (user == null) {
        throw new AppError('user not found!', StatusCodes.NOT_FOUND)
      }

      user.userCoin = payload.userCoin
      await user.save()
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[UserService] updateUserCoin failed: ${String(serviceError)}`)
      throw new AppError('Failed to update coin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updatePassword(payload: IUpdateUserPassword) {
    try {
      const user = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userWhatsAppNumber: { [Op.eq]: payload.userWhatsAppNumber },
          userRole: 'user'
        }
      })

      if (user == null) {
        throw new AppError('User not found!', StatusCodes.NOT_FOUND)
      }

      await user.update({ userPassword: hashPassword(payload.userPassword) })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[UserService] updatePassword failed: ${String(serviceError)}`)
      throw new AppError('Failed to update password', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async requestOtp(payload: IRequestOtp) {
    try {
      const existingUser = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
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

      const message = encodeURIComponent(
        `*${otpCode}* adalah kode verifikasi Anda.\n\n` +
          'Pengingat keamanan: Untuk memastikan keamanan akun Anda, mohon jangan bagikan informasi apa pun tentang akun Anda kepada siapa pun.'
      )

      const wablasResponse = await axios.get(
        `${appConfigs.wablas.url}/send-message?phone=${payload.whatsappNumber}&message=${message}&token=${appConfigs.wablas.apiKey}`
      )

      if (wablasResponse.status !== 200) {
        throw new AppError('Failed to send OTP', StatusCodes.BAD_GATEWAY)
      }

      return { message: 'success' as const }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[UserService] requestOtp failed: ${String(serviceError)}`)
      throw new AppError('Failed to request OTP', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async verifyOtp(payload: IVerifyOtp) {
    try {
      const storedOtp = await redis.get(`otp:${payload.otpCode}`)

      if (!storedOtp || storedOtp !== payload.otpCode) {
        throw new AppError('Invalid or expired OTP!', StatusCodes.UNAUTHORIZED)
      }

      await redis.del(`otp:${payload.otpCode}`)
      return { message: 'success' as const }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[UserService] verifyOtp failed: ${String(serviceError)}`)
      throw new AppError('Failed to verify OTP', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
