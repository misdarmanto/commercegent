import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { UserModel } from '../models/UserModel'
import { SettingAttributes, SettingModel } from '../models/SettingModel'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  IFindSetting,
  ICreateSetting,
  IUpdateSetting,
  IRemoveSetting
} from '../schemas/SettingSchema'

const UPDATABLE_FIELDS = [
  'bankName',
  'bankNumber',
  'bankOwner',
  'qris',
  'banner',
  'whatsappNumber',
  'waBlasToken',
  'waBlasServer'
] as const

export class SettingService {
  static async findSettings(payload: IFindSetting) {
    try {
      const { settingType } = payload

      const whereCondition: Record<string, unknown> = {
        deleted: { [Op.eq]: false }
      }

      let attributes: string[] | undefined

      if (settingType != null) {
        whereCondition.settingType = { [Op.eq]: settingType }

        switch (settingType) {
          case 'bank':
            attributes = [
              'createdAt',
              'updatedAt',
              'deleted',
              'settingId',
              'settingType',
              'bankName',
              'bankNumber',
              'bankOwner'
            ]
            break

          case 'qris':
            attributes = [
              'createdAt',
              'updatedAt',
              'deleted',
              'settingId',
              'settingType',
              'qris'
            ]
            break

          case 'general':
            attributes = [
              'createdAt',
              'updatedAt',
              'deleted',
              'settingId',
              'settingType',
              'banner',
              'whatsappNumber'
            ]
            break

          case 'wa_blas':
            attributes = [
              'createdAt',
              'updatedAt',
              'deleted',
              'settingId',
              'settingType',
              'waBlasToken',
              'waBlasServer'
            ]
            break

          default:
            throw new AppError('invalid setting type!', StatusCodes.BAD_REQUEST)
        }
      }

      const results = await SettingModel.findAll({
        where: whereCondition,
        attributes,
        order: [['settingId', 'desc']]
      })

      return results
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[SettingService] findSettings failed: ${String(serviceError)}`)
      throw new AppError('Failed to find settings', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  private static async assertSuperAdmin(userId: number) {
    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const row = await UserModel.findOne({
      where: {
        deleted: { [Op.eq]: false },
        userId,
        userRole: { [Op.eq]: 'superAdmin' }
      }
    })

    if (row == null) {
      throw new AppError('access denied!', StatusCodes.FORBIDDEN)
    }
  }

  static async createSetting(userId: number, payload: ICreateSetting) {
    await this.assertSuperAdmin(userId)

    try {
      const uniqueTypes = ['general', 'wa_blas']

      let existingSetting: Awaited<ReturnType<typeof SettingModel.findOne>> = null
      if (uniqueTypes.includes(payload.settingType)) {
        existingSetting = await SettingModel.findOne({
          where: {
            deleted: { [Op.eq]: false },
            settingType: { [Op.eq]: payload.settingType }
          }
        })
      }

      const newSettingData: Partial<SettingAttributes> = {
        settingType: payload.settingType
      }

      switch (payload.settingType) {
        case 'general':
          newSettingData.banner =
            (payload.banner as SettingAttributes['banner'] | undefined) ?? null
          newSettingData.whatsappNumber = payload.whatsappNumber ?? null
          break

        case 'wa_blas':
          newSettingData.waBlasToken = payload.waBlasToken ?? null
          newSettingData.waBlasServer = payload.waBlasServer ?? null
          break

        default:
          throw new AppError('invalid setting type!', StatusCodes.BAD_REQUEST)
      }

      if (existingSetting != null) {
        await existingSetting.update(newSettingData)
        return { status: 'updated' as const, data: existingSetting }
      }

      const createdSetting = await SettingModel.create(
        newSettingData as SettingAttributes
      )
      return { status: 'created' as const, data: createdSetting }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[SettingService] createSetting failed: ${String(serviceError)}`)
      throw new AppError('Failed to create setting', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateSetting(payload: IUpdateSetting) {
    try {
      const existingSetting = await SettingModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          settingId: { [Op.eq]: payload.settingId }
        }
      })

      if (existingSetting == null) {
        throw new AppError('setting not found!', StatusCodes.NOT_FOUND)
      }

      const newData: Partial<SettingAttributes> = {}

      for (const key of UPDATABLE_FIELDS) {
        const value = payload[key as keyof IUpdateSetting]
        if (value !== undefined && value !== null && value !== '') {
          ;(newData as Record<string, unknown>)[key] = value
        }
      }

      await SettingModel.update(newData, {
        where: {
          deleted: { [Op.eq]: false },
          settingId: { [Op.eq]: payload.settingId }
        }
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[SettingService] updateSetting failed: ${String(serviceError)}`)
      throw new AppError('Failed to update setting', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeSetting(userId: number, payload: IRemoveSetting) {
    await this.assertSuperAdmin(userId)

    try {
      const row = await SettingModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          settingId: { [Op.eq]: payload.settingId }
        }
      })

      if (row == null) {
        throw new AppError('setting not found!', StatusCodes.NOT_FOUND)
      }

      await SettingModel.update(
        { deleted: true },
        {
          where: {
            settingId: { [Op.eq]: payload.settingId }
          }
        }
      )
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[SettingService] removeSetting failed: ${String(serviceError)}`)
      throw new AppError('Failed to remove setting', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
