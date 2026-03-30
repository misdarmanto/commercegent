import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AddressesModel } from '../models/address'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { RegionService } from './regionService'
import type { ICreateAddressBody } from '../schemas/AddressSchema'

function assertAdminRole(userRole: string | undefined): void {
  if (userRole !== 'admin' && userRole !== 'superAdmin') {
    throw new AppError('Forbidden', StatusCodes.FORBIDDEN)
  }
}

export class AddressService {
  static async createUserAddress(userId: number, body: ICreateAddressBody) {
    try {
      const payload = {
        ...body,
        addressUserId: userId,
        addressCategory: 'user' as const,
        deleted: 0
      }

      const existing = await AddressesModel.findOne({
        where: {
          addressUserId: userId,
          addressCategory: 'user'
        }
      })

      if (existing != null) {
        await existing.update(payload)
        return { message: 'User address updated' as const }
      }

      await AddressesModel.create(payload)
      return { message: 'User address created' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AddressService] createUserAddress failed: ${String(error)}`)
      throw new AppError('Failed to save address', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createAdminAddress(
    userId: number,
    userRole: string | undefined,
    body: ICreateAddressBody
  ) {
    try {
      assertAdminRole(userRole)

      const payload = {
        ...body,
        addressUserId: userId,
        addressCategory: 'admin' as const,
        deleted: 0
      }

      const existing = await AddressesModel.findOne({
        where: { addressCategory: 'admin' }
      })

      if (existing != null) {
        await existing.update(payload)
        return { message: 'Admin address updated' as const }
      }

      await AddressesModel.create(payload)
      return { message: 'Admin address created' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AddressService] createAdminAddress failed: ${String(error)}`)
      throw new AppError(
        'Failed to save admin address',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async removeAddress(addressId: number) {
    try {
      const row = await AddressesModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          addressId: { [Op.eq]: addressId }
        }
      })

      if (row == null) {
        throw new AppError('address not found!', StatusCodes.NOT_FOUND)
      }

      row.deleted = 1
      await row.save()

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AddressService] removeAddress failed: ${String(error)}`)
      throw new AppError('Failed to remove address', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findUserAddress(userId: number) {
    try {
      return await AddressesModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          addressUserId: { [Op.eq]: userId },
          addressCategory: 'user'
        }
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AddressService] findUserAddress failed: ${String(error)}`)
      throw new AppError('Failed to fetch address', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAdminAddress(userRole: string | undefined) {
    try {
      assertAdminRole(userRole)

      return await AddressesModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          addressCategory: 'admin'
        }
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AddressService] findAdminAddress failed: ${String(error)}`)
      throw new AppError(
        'Failed to fetch admin address',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async getProvinces() {
    try {
      return await RegionService.getProvinces()
    } catch (error) {
      logger.error(`[AddressService] getProvinces failed: ${String(error)}`)
      throw new AppError('Failed to fetch provinces', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async getRegencies(provinceId: string) {
    try {
      return await RegionService.getRegencies(provinceId)
    } catch (error) {
      logger.error(`[AddressService] getRegencies failed: ${String(error)}`)
      throw new AppError('Failed to fetch regencies', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async getDistricts(regencyId: string) {
    try {
      return await RegionService.getDistricts(regencyId)
    } catch (error) {
      logger.error(`[AddressService] getDistricts failed: ${String(error)}`)
      throw new AppError('Failed to fetch districts', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async getVillages(districtId: string) {
    try {
      return await RegionService.getVillages(districtId)
    } catch (error) {
      logger.error(`[AddressService] getVillages failed: ${String(error)}`)
      throw new AppError('Failed to fetch villages', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
