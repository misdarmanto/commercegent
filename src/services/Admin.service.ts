import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { UserModel, type UserAttributes } from '../models/user'
import { Pagination } from '../utilities/pagination'
import { hashPassword } from '../utilities/scurePassword'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import {
  IFindAllAdmins,
  IFindDetailAdmin,
  IUpdateAdmin,
  type ICreateAdmin
} from '../schemas/AdminSchema'

export class AdminService {
  private static buildFindAllWhere(
    userId: number,
    payload: IFindAllAdmins
  ): WhereOptions<UserAttributes> {
    const where: WhereOptions<UserAttributes> = {
      deleted: { [Op.eq]: 0 },
      userRole: { [Op.not]: 'user' },
      userId: { [Op.not]: userId }
    }

    if (payload.search != null) {
      where.userName = { [Op.like]: `%${payload.search}%` }
    }

    return where
  }

  static async findAllAdmins(userId: number, payload: IFindAllAdmins) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await UserModel.findAndCountAll({
        where: this.buildFindAllWhere(userId, payload),
        attributes: ['userId', 'userName', 'userRole', 'createdAt', 'updatedAt'],
        order: [['userId', 'desc']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AdminService] findAllAdmins failed: ${String(serviceError)}`)
      throw new AppError('Failed to find admins', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findDetailAdmin(payload: IFindDetailAdmin) {
    try {
      const result = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userRole: { [Op.not]: 'user' },
          userId: { [Op.eq]: payload.adminId }
        },
        attributes: [
          'userId',
          'userName',
          'userRole',
          'userWhatsAppNumber',
          'createdAt',
          'updatedAt'
        ]
      })

      if (result == null) {
        throw new AppError('Admin not found!', StatusCodes.FORBIDDEN)
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AdminService] findDetailAdmin failed: ${String(serviceError)}`)
      throw new AppError('Failed to find admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createAdmin(payload: ICreateAdmin) {
    try {
      const existing = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userWhatsAppNumber: { [Op.eq]: payload.adminWhatsAppNumber }
        }
      })

      if (existing != null) {
        throw new AppError(
          `Nomor WA ${payload.adminWhatsAppNumber} sudah terdaftar. Silahkan gunakan yang lain.`,
          StatusCodes.BAD_REQUEST
        )
      }

      const createPayload = {
        userName: payload.adminName,
        userPassword: hashPassword(payload.adminPassword),
        userWhatsAppNumber: payload.adminWhatsAppNumber,
        userPhoto: payload.adminPhoto ?? '',
        userRole: payload.adminRole,
        userGender: 'pria',
        userCoin: 0,
        userFcmId: '',
        userPartnerCode: '',
        deleted: 0
      } satisfies Partial<UserAttributes>

      await UserModel.create(createPayload as unknown as UserAttributes)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AdminService] createAdmin failed: ${String(serviceError)}`)
      throw new AppError('Failed to create admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
  static async updateAdmin(userId: number, payload: IUpdateAdmin) {
    try {
      let hashedPassword: string | undefined
      if (payload.adminPassword != null && payload.adminPassword.length > 0) {
        hashedPassword = hashPassword(payload.adminPassword)
      }

      if (payload.adminName != null && payload.adminName.length > 0) {
        const duplicateName = await UserModel.findOne({
          where: {
            deleted: { [Op.eq]: 0 },
            userId: { [Op.not]: userId },
            userName: { [Op.eq]: payload.adminName }
          }
        })

        if (duplicateName != null) {
          throw new AppError('admin name sudah terdaftar!', StatusCodes.BAD_REQUEST)
        }
      }

      const newData: Partial<UserAttributes> = {}
      if (payload.adminName != null && payload.adminName.length > 0) {
        newData.userName = payload.adminName
      }
      if (hashedPassword != null) {
        newData.userPassword = hashedPassword
      }
      if (payload.adminRole != null && payload.adminRole.length > 0) {
        newData.userRole = payload.adminRole as UserAttributes['userRole']
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
        throw new AppError('admin not found!', StatusCodes.NOT_FOUND)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AdminService] updateAdmin failed: ${String(serviceError)}`)
      throw new AppError('Failed to update admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
