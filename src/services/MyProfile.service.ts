import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { UserModel, type UserAttributes } from '../models/user'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { hashPassword } from '../utilities/scurePassword'
import type { IUpdateMyProfile } from '../schemas/MyProfileSchema'

export class MyProfileService {
  static async findMyProfile(userId: number) {
    try {
      const result = await UserModel.findOne({
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

      if (result == null) {
        throw new AppError('user not found!', StatusCodes.NOT_FOUND)
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[MyProfileService] findMyProfile failed: ${String(serviceError)}`)
      throw new AppError('Failed to find profile', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateMyProfile(userId: number, payload: IUpdateMyProfile) {
    try {
      const newData: Partial<
        Pick<UserAttributes, 'userName' | 'userPassword' | 'userRole'>
      > = {}

      if (payload.userName != null && payload.userName.length > 0) {
        newData.userName = payload.userName
      }
      if (payload.userPassword != null && payload.userPassword.length > 0) {
        newData.userPassword = hashPassword(payload.userPassword)
      }
      if (payload.userRole != null) {
        newData.userRole = payload.userRole as unknown as UserAttributes['userRole']
      }

      if (Object.keys(newData).length === 0) {
        throw new AppError('No fields to update', StatusCodes.BAD_REQUEST)
      }

      const [updatedRows] = await UserModel.update(newData, {
        where: {
          deleted: { [Op.eq]: 0 },
          userId: { [Op.eq]: userId }
        }
      })

      if (updatedRows === 0) {
        throw new AppError('user not found!', StatusCodes.NOT_FOUND)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[MyProfileService] updateMyProfile failed: ${String(serviceError)}`)
      throw new AppError('Failed to update profile', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
