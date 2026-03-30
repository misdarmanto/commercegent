import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { UserModel } from '../models/user'
import { SettingAttributes, SettingModel } from '../models/settings'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  ICreateSettingBody,
  IFindSettingQuery,
  IRemoveSettingParams,
  IUpdateSettingBody
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
  private static async assertSuperAdmin(userId: number | undefined) {
    if (userId == null) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const row = await UserModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        userId,
        userRole: { [Op.eq]: 'superAdmin' }
      }
    })

    if (row == null) {
      throw new AppError('access denied!', StatusCodes.FORBIDDEN)
    }
  }

  static async findSettings(query: IFindSettingQuery) {
    try {
      const { settingType } = query

      const whereCondition: Record<string, unknown> = {
        deleted: { [Op.eq]: 0 }
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
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[SettingService] findSettings failed: ${String(error)}`)
      throw new AppError('Gagal mengambil pengaturan', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createSetting(userId: number | undefined, body: ICreateSettingBody) {
    await this.assertSuperAdmin(userId)

    try {
      const uniqueTypes = ['general', 'wa_blas']

      let existingSetting: Awaited<ReturnType<typeof SettingModel.findOne>> = null
      if (uniqueTypes.includes(body.settingType)) {
        existingSetting = await SettingModel.findOne({
          where: {
            deleted: { [Op.eq]: 0 },
            settingType: { [Op.eq]: body.settingType }
          }
        })
      }

      const newSettingData: Partial<SettingAttributes> = {
        settingType: body.settingType
      }

      switch (body.settingType) {
        case 'general':
          newSettingData.banner =
            (body.banner as SettingAttributes['banner'] | undefined) ?? null
          newSettingData.whatsappNumber = body.whatsappNumber ?? null
          break

        case 'wa_blas':
          newSettingData.waBlasToken = body.waBlasToken ?? null
          newSettingData.waBlasServer = body.waBlasServer ?? null
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
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[SettingService] createSetting failed: ${String(error)}`)
      throw new AppError('Gagal menyimpan pengaturan', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateSetting(body: IUpdateSettingBody) {
    try {
      const existingSetting = await SettingModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          settingId: { [Op.eq]: body.settingId }
        }
      })

      if (existingSetting == null) {
        throw new AppError('setting not found!', StatusCodes.NOT_FOUND)
      }

      const newData: Partial<SettingAttributes> = {}

      for (const key of UPDATABLE_FIELDS) {
        const value = body[key as keyof IUpdateSettingBody]
        if (value !== undefined && value !== null && value !== '') {
          ;(newData as Record<string, unknown>)[key] = value
        }
      }

      await SettingModel.update(newData, {
        where: {
          deleted: { [Op.eq]: 0 },
          settingId: { [Op.eq]: body.settingId }
        }
      })

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[SettingService] updateSetting failed: ${String(error)}`)
      throw new AppError(
        'Gagal memperbarui pengaturan',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async removeSetting(userId: number | undefined, params: IRemoveSettingParams) {
    await this.assertSuperAdmin(userId)

    try {
      const row = await SettingModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          settingId: { [Op.eq]: params.settingId }
        }
      })

      if (row == null) {
        throw new AppError('setting not found!', StatusCodes.NOT_FOUND)
      }

      await SettingModel.update(
        { deleted: 1 },
        {
          where: {
            settingId: { [Op.eq]: params.settingId }
          }
        }
      )

      return { message: 'setting deleted successfully!' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[SettingService] removeSetting failed: ${String(error)}`)
      throw new AppError('Gagal menghapus pengaturan', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
