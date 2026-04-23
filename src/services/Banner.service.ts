import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { sequelizeInit } from '../configs/database'
import type {
  ICreateBanner,
  IRemoveBanner,
  IFindAllBanners
} from '../schemas/BannerSchema'
import { BannerAttributes, BannerModel } from '../models/BannerModel'
import { Pagination } from '../utilities/pagination'

export class BannerService {
  private static buildFindAllWhere(payload: IFindAllBanners) {
    const whereCondition: Record<string, unknown> = {
      deleted: { [Op.eq]: false }
    }

    return whereCondition
  }

  static async findAllBanners(payload: IFindAllBanners) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const results = await BannerModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        attributes: ['bannerId', 'bannerImage', 'bannerOrder'],
        order: [['bannerOrder', 'asc']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(results)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[BannerService] findAllBanners failed: ${String(serviceError)}`)
      throw new AppError('Failed to find all banners', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createBanner(payload: ICreateBanner) {
    try {
      await sequelizeInit.transaction(async (transaction) => {
        const requestedOrder = payload.bannerOrder ?? 0

        const existingBannerWithOrder = await BannerModel.findOne({
          where: {
            deleted: { [Op.eq]: false },
            bannerOrder: { [Op.eq]: requestedOrder }
          },
          transaction,
          lock: transaction.LOCK.UPDATE
        })

        if (existingBannerWithOrder != null) {
          const currentMaxOrder =
            (await BannerModel.max('bannerOrder', {
              where: { deleted: { [Op.eq]: false } },
              transaction
            })) ?? 0

          await existingBannerWithOrder.update(
            {
              bannerOrder: Number(currentMaxOrder) + 1
            },
            { transaction }
          )
        }

        const createdBannerPayload = {
          bannerImage: payload.bannerImage ?? '',
          bannerOrder: requestedOrder,
          deleted: false
        } as BannerAttributes

        await BannerModel.create(createdBannerPayload, { transaction })
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[BannerService] createBanner failed: ${String(serviceError)}`)
      throw new AppError('Failed to create banner', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeBanner(payload: IRemoveBanner) {
    try {
      const [updatedRows] = await BannerModel.update(
        { deleted: true },
        {
          where: {
            bannerId: { [Op.eq]: payload.bannerId }
          }
        }
      )

      if (updatedRows === 0) {
        throw new AppError('banner not found!', StatusCodes.NOT_FOUND)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[SettingService] removeSetting failed: ${String(serviceError)}`)
      throw new AppError('Failed to remove setting', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
