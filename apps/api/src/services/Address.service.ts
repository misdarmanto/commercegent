import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AddressesAttributes, AddressesModel } from '../models/AddressModel'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { sequelizeInit } from '../configs/database'
import type {
  ICreateAddress,
  IFindAllAddresses,
  IRemoveAddress,
  IUpdateAddress,
  IUpdateAddressType
} from '../schemas/addressSchema'

export class AddressService {
  static buildFindAllWhere(userId: number, payload: IFindAllAddresses) {
    const where: WhereOptions<AddressesAttributes> = {
      deleted: { [Op.eq]: false },
      addressUserId: { [Op.eq]: userId }
    }

    if (payload.addressCategory != null) {
      where.addressCategory = payload.addressCategory
    }

    if (payload.addressType != null) {
      where.addressType = payload.addressType
    }

    if (payload.search != null) {
      where.addressUserName = { [Op.like]: `%${payload.search}%` }
    }

    return where
  }

  static async findUserAddress(userId: number, payload: IFindAllAddresses) {
    try {
      return await AddressesModel.findAll({
        where: this.buildFindAllWhere(userId, payload),
        order: [['addressId', 'DESC']],
        limit: 5
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
          deleted: { [Op.eq]: false },
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
      const existing = await AddressesModel.count({
        where: {
          deleted: { [Op.eq]: false },
          addressUserId: userId,
          addressCategory: 'user'
        }
      })

      if (existing > 5) {
        throw new AppError(
          'You can not create more than 5 addresses',
          StatusCodes.BAD_REQUEST
        )
      }

      const createPayload = {
        ...payload,
        addressUserId: userId,
        addressCategory: 'user' as const,
        deleted: false
      } as AddressesAttributes

      if (existing === 0) {
        createPayload.addressType = 'main'
      } else {
        createPayload.addressType = 'secondary'
      }

      await AddressesModel.create(createPayload)
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
        deleted: false,
        addressType: 'secondary' as const
      }

      const where = {
        deleted: { [Op.eq]: false },
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

  static async updateAddress(userId: number, payload: IUpdateAddress) {
    try {
      const [updatedRows] = await AddressesModel.update(payload, {
        where: {
          deleted: { [Op.eq]: false },
          addressUserId: userId,
          addressId: { [Op.eq]: payload.addressId }
        }
      })

      if (updatedRows === 0) {
        throw new AppError('address not found!', StatusCodes.NOT_FOUND)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AddressService] updateUserAddress failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to update user address',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async updateAddressTypeToMain(userId: number, payload: IUpdateAddressType) {
    try {
      await sequelizeInit.transaction(async (transaction) => {
        const targetAddress = await AddressesModel.findOne({
          where: {
            deleted: { [Op.eq]: false },
            addressUserId: userId,
            addressCategory: 'user',
            addressId: { [Op.eq]: payload.addressId }
          },
          transaction
        })

        if (targetAddress == null) {
          throw new AppError('address not found!', StatusCodes.NOT_FOUND)
        }

        await AddressesModel.update(
          { addressType: 'secondary' },
          {
            where: {
              deleted: { [Op.eq]: false },
              addressUserId: userId,
              addressCategory: 'user',
              addressType: { [Op.eq]: 'main' }
            },
            transaction
          }
        )

        await AddressesModel.update(
          { addressType: 'main' },
          {
            where: {
              deleted: { [Op.eq]: false },
              addressUserId: userId,
              addressCategory: 'user',
              addressId: { [Op.eq]: payload.addressId }
            },
            transaction
          }
        )
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AddressService] updateUserAddress failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to update user address',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async removeAddress(userId: number, payload: IRemoveAddress) {
    try {
      const [updatedRows] = await AddressesModel.update(
        { deleted: true },
        {
          where: {
            deleted: { [Op.eq]: false },
            addressId: { [Op.eq]: payload.addressId },
            addressUserId: { [Op.eq]: userId }
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
