import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
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
      const createdBannerPayload = {
        bannerImage: payload.bannerImage ?? '',
        bannerOrder: payload.bannerOrder ?? 0,
        deleted: false
      } as BannerAttributes

      await BannerModel.create(createdBannerPayload)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[BannerService] createBanner failed: ${String(serviceError)}`)
      throw new AppError('Failed to create banner', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeBanner(payload: IRemoveBanner) {
    try {
      const row = await BannerModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          bannerId: { [Op.eq]: payload.bannerId }
        }
      })

      if (row == null) {
        throw new AppError('banner not found!', StatusCodes.NOT_FOUND)
      }

      await BannerModel.update(
        { deleted: true },
        {
          where: {
            bannerId: { [Op.eq]: payload.bannerId }
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
