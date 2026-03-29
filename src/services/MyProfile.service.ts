import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { UserModel } from '../models/user'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { hashPassword } from '../utilities/scurePassword'
import type { IUpdateMyProfileBody } from '../schemas/MyProfileSchema'

export class MyProfileService {
  static async findMyProfile(userId: number) {
    try {
      const row = await UserModel.findOne({
        where: {
          deleted: 0,
          userId
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

      if (row == null) {
        throw new AppError('user not found!', StatusCodes.NOT_FOUND)
      }

      return row
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[MyProfileService] findMyProfile failed: ${String(error)}`)
      throw new AppError('Failed to fetch profile', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateMyProfile(userId: number, body: IUpdateMyProfileBody) {
    try {
      const newData: Record<string, unknown> = {}

      if (body.userName != null && body.userName.length > 0) {
        newData.userName = body.userName
      }
      if (body.userPassword != null && body.userPassword.length > 0) {
        newData.userPassword = hashPassword(body.userPassword)
      }
      if (body.userRole != null) {
        newData.userRole = body.userRole
      }

      await UserModel.update(newData, {
        where: {
          deleted: { [Op.eq]: 0 },
          userId: { [Op.eq]: userId }
        }
      })

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[MyProfileService] updateMyProfile failed: ${String(error)}`)
      throw new AppError('Failed to update profile', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
