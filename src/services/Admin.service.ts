import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { UserModel, type UserAttributes } from '../models/user'
import { Pagination } from '../utilities/pagination'
import { hashPassword } from '../utilities/scurePassword'
import { generateAccessToken } from '../utilities/jwt'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import {
  IFindAllAdmins,
  IFindDetailAdmin,
  IUpdateAdmin,
  type ICreateAdmin
} from '../schemas/AdminSchema'
import { ILoginAdmin } from '../schemas/AuthSchema'

export class AdminService {
  static async createAdmin(payload: ICreateAdmin) {
    try {
      const existing = await UserModel.findOne({
        raw: true,
        where: {
          deleted: { [Op.eq]: 0 },
          [Op.or]: [{ userWhatsAppNumber: { [Op.eq]: payload.adminWhatsAppNumber } }]
        }
      })

      if (existing != null) {
        throw new AppError(
          `Nomor WA ${payload.adminWhatsAppNumber} sudah terdaftar. Silahkan gunakan yang lain.`,
          StatusCodes.BAD_REQUEST
        )
      }

      const payload: Record<string, unknown> = {
        ...payload,
        adminPassword: hashPassword(payload.adminPassword)
      }

      await UserModel.create(payload as unknown as UserAttributes)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AdminService] createAdmin failed: ${String(error)}`)
      throw new AppError('Failed to create admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async loginAdmin(payload: ILoginAdmin) {
    try {
      const user = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
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
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AdminService] loginAdmin failed: ${String(error)}`)
      throw new AppError('Failed to login', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateAdmin(payload: IUpdateAdmin) {
    try {
      const actor = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userId: { [Op.eq]: payload.jwtPayload?.userId },
          [Op.or]: [
            { userRole: { [Op.eq]: 'admin' } },
            { userRole: { [Op.eq]: 'superAdmin' } }
          ]
        }
      })

      if (actor == null) {
        throw new AppError('access denied!', StatusCodes.UNAUTHORIZED)
      }

      let hashedPassword: string | undefined
      if (payload.adminPassword != null && payload.adminPassword.length > 0) {
        hashedPassword = hashPassword(payload.adminPassword)
      }

      if (payload.adminName != null && payload.adminName.length > 0) {
        const duplicateName = await UserModel.findOne({
          where: {
            deleted: { [Op.eq]: 0 },
            userId: { [Op.not]: payload.jwtPayload?.userId },
            userName: { [Op.eq]: payload.adminName }
          }
        })

        if (duplicateName != null) {
          throw new AppError('admin name sudah terdaftar!', StatusCodes.NOT_FOUND)
        }
      }

      const newData: Record<string, unknown> = {}
      if (payload.adminName != null && payload.adminName.length > 0) {
        newData.userName = payload.adminName
      }
      if (hashedPassword != null) {
        newData.adminPassword = hashedPassword
      }
      if (payload.adminRole != null && payload.adminRole.length > 0) {
        newData.adminRole = payload.adminRole
      }

      await UserModel.update(newData, {
        where: {
          deleted: { [Op.eq]: 0 },
          userId: { [Op.eq]: payload.jwtPayload?.userId }
        }
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AdminService] updateAdmin failed: ${String(error)}`)
      throw new AppError('Failed to update admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAllAdmins(payload: IFindAllAdmins) {
    try {
      const page = new Pagination(payload.page, payload.size)

      const users = await UserModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          userRole: { [Op.not]: 'user' },
          userId: { [Op.not]: payload.jwtPayload?.userId },
          ...(Boolean(payload.search) && {
            [Op.or]: [{ userName: { [Op.like]: `%${payload.search}%` } }]
          })
        },
        attributes: ['userId', 'userName', 'userRole', 'createdAt', 'updatedAt'],
        order: [['userId', 'desc']],
        ...(payload.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(users)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AdminService] findAllAdmins failed: ${String(error)}`)
      throw new AppError('Failed to fetch admins', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findDetailAdmin(payload: IFindDetailAdmin) {
    try {
      const user = await UserModel.findOne({
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

      if (user == null) {
        throw new AppError('admin not found!', StatusCodes.FORBIDDEN)
      }

      return user
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AdminService] findDetailAdmin failed: ${String(error)}`)
      throw new AppError('Failed to fetch admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
