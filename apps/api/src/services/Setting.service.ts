import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { SettingAttributes, SettingModel } from '../models/SettingModel'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type { IFindSetting, ICreateSetting } from '../schemas/SettingSchema'

export class SettingService {
  private static buildFindOneWhere(payload: IFindSetting) {
    const where: WhereOptions<SettingAttributes> = {
      deleted: { [Op.eq]: false }
    }

    return where
  }
  static async findSetting(payload: IFindSetting) {
    try {
      const results = await SettingModel.findOne({
        where: this.buildFindOneWhere(payload),
        attributes: ['settingId', 'whatsappNumber']
      })
      return results
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[SettingService] findSetting failed: ${String(serviceError)}`)
      throw new AppError('Failed to find setting', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createSetting(payload: ICreateSetting) {
    try {
      const existingSetting = await SettingModel.findOne({
        where: {
          deleted: { [Op.eq]: false }
        }
      })

      if (existingSetting === null) {
        await SettingModel.create(payload)
      } else {
        await SettingModel.update(payload, {
          where: {
            deleted: { [Op.eq]: false }
          }
        })
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[SettingService] createSetting failed: ${String(serviceError)}`)
      throw new AppError('Failed to create setting', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
