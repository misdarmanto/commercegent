import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { UserModel, type UserAttributes } from '../models/UserModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { hashPassword } from '../utilities/scurePassword'
import type {
  IFindAllUsers,
  IUpdateUser,
  IUpdateUserCoin,
  IUpdateUserPassword,
  IFindDetailUser,
  IRemoveUser
} from '../schemas/UserSchema'

export class UserService {
  private static buildFindAllWhere(payload: IFindAllUsers): WhereOptions<UserAttributes> {
    const where: WhereOptions<UserAttributes> = {
      deleted: { [Op.eq]: false }
    }

    if (payload.userRole != null) {
      where.userRole = { [Op.eq]: payload.userRole }
    }
    if (payload.userRole == null) {
      where.userRole = { [Op.eq]: 'user' }
    }
    if (payload.search != null) {
      where.userName = { [Op.like]: `%${payload.search}%` }
    }
    if (payload.search != null) {
      where.userPartnerCode = { [Op.like]: `%${payload.search}%` }
    }
    return where
  }

  static async findAllUsers(payload: IFindAllUsers) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const users = await UserModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
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
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(users)
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
          deleted: { [Op.eq]: false },
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
        where: { deleted: false, userId }
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
        where: { deleted: { [Op.eq]: false }, userId: { [Op.eq]: payload.userId } }
      })

      if (user == null) {
        throw new AppError('user not found!', StatusCodes.NOT_FOUND)
      }

      user.deleted = true
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
        where: { deleted: { [Op.eq]: false }, userId: { [Op.eq]: payload.userId } }
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
          deleted: { [Op.eq]: false },
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
}
