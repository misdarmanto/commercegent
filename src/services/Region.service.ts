import { StatusCodes } from 'http-status-codes'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { RegionAPIService } from './external/RegionApi.service'

export class RegionService {
  static async getProvinces() {
    try {
      return await RegionAPIService.getProvinces()
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AddressService] getProvinces failed: ${String(serviceError)}`)
      throw new AppError('Failed to get provinces', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async getRegencies(provinceId: string) {
    try {
      return await RegionAPIService.getRegencies(provinceId)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AddressService] getRegencies failed: ${String(serviceError)}`)
      throw new AppError('Failed to get regencies', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async getDistricts(regencyId: string) {
    try {
      return await RegionAPIService.getDistricts(regencyId)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AddressService] getDistricts failed: ${String(serviceError)}`)
      throw new AppError('Failed to get districts', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async getVillages(districtId: string) {
    try {
      return await RegionAPIService.getVillages(districtId)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AddressService] getVillages failed: ${String(serviceError)}`)
      throw new AppError('Failed to get villages', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
