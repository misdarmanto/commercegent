import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AddressesModel } from '../models/address'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type { ICreateAddress } from '../schemas/AddressSchema'

export class AddressService {
  static async findUserAddress(userId: number) {
    try {
      return await AddressesModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          addressUserId: { [Op.eq]: userId },
          addressCategory: 'user'
        }
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AddressService] findUserAddress failed: ${String(serviceError)}`)
      throw new AppError('Failed to find user address', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAdminAddress() {
    try {
      return await AddressesModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          addressCategory: 'admin'
        }
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AddressService] findAdminAddress failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to find admin address',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async createUserAddress(userId: number, payload: ICreateAddress) {
    try {
      const createPayload = {
        ...payload,
        addressUserId: userId,
        addressCategory: 'user' as const,
        deleted: 0
      }

      const where = {
        deleted: { [Op.eq]: 0 },
        addressUserId: userId,
        addressCategory: 'user'
      }

      const [updatedRows] = await AddressesModel.update(createPayload, { where })

      if (updatedRows === 0) {
        await AddressesModel.create(createPayload)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AddressService] createUserAddress failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to create user address',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async createAdminAddress(userId: number, payload: ICreateAddress) {
    try {
      const createPayload = {
        ...payload,
        addressUserId: userId,
        addressCategory: 'admin' as const,
        deleted: 0
      }

      const where = {
        deleted: { [Op.eq]: 0 },
        addressCategory: 'admin'
      }

      const [updatedRows] = await AddressesModel.update(createPayload, { where })

      if (updatedRows === 0) {
        await AddressesModel.create(createPayload)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AddressService] createAdminAddress failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to create admin address',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async removeAddress(addressId: number) {
    try {
      const [updatedRows] = await AddressesModel.update(
        { deleted: 1 },
        {
          where: {
            deleted: { [Op.eq]: 0 },
            addressId: { [Op.eq]: addressId }
          }
        }
      )

      if (updatedRows === 0) {
        throw new AppError('address not found!', StatusCodes.NOT_FOUND)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AddressService] removeAddress failed: ${String(serviceError)}`)
      throw new AppError('Failed to remove address', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
