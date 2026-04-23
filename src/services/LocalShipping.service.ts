import { Op, type WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { LocalShippingAttributes, LocalShippingModel } from '../models/LocalShippingModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  ICreateLocalShipping,
  IDetailLocalShipping,
  IFindAllLocalShipping,
  IRemoveLocalShipping,
  IUpdateLocalShipping
} from '../schemas/LocalShippingSchema'

export class LocalShippingService {
  private static buildFindAllWhere(
    payload: IFindAllLocalShipping
  ): WhereOptions<LocalShippingAttributes> {
    const where: WhereOptions<LocalShippingAttributes> = {
      deleted: { [Op.eq]: false }
    }

    if (payload.search != null) {
      where.localShippingProvinceName = { [Op.like]: `%${payload.search}%` }
    }

    return where
  }

  static async findAll(payload: IFindAllLocalShipping) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await LocalShippingModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        order: [['localShippingId', 'desc']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[LocalShippingService] findAll failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to find local shipping data',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findDetail(payload: IDetailLocalShipping) {
    try {
      const result = await LocalShippingModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          localShippingId: { [Op.eq]: payload.localShippingId }
        }
      })

      if (result == null) {
        throw new AppError('Local shipping not found', StatusCodes.NOT_FOUND)
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[LocalShippingService] findDetail failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to find local shipping detail',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async create(payload: ICreateLocalShipping) {
    try {
      const existingLocalShipping = await LocalShippingModel.findOne({
        where: {
          localShippingProvinceId: { [Op.eq]: payload.localShippingProvinceId },
          deleted: { [Op.eq]: false }
        }
      })

      if (existingLocalShipping != null) {
        throw new AppError('Local shipping already exists', StatusCodes.BAD_REQUEST)
      }

      await LocalShippingModel.create({
        localShippingCompanyName: payload.localShippingCompanyName ?? '',
        localShippingProvinceName: payload.localShippingProvinceName ?? '',
        localShippingProvinceId: payload.localShippingProvinceId ?? '',
        localShippingPricePerKg: payload.localShippingPricePerKg ?? 0,
        localShippingDuration: payload.localShippingDuration ?? '',
        deleted: false
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[LocalShippingService] create failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to create local shipping',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async update(payload: IUpdateLocalShipping) {
    try {
      const { localShippingId, ...newData } = payload

      if (Object.keys(newData).length === 0) {
        throw new AppError('No fields to update', StatusCodes.BAD_REQUEST)
      }

      const [updatedRows] = await LocalShippingModel.update(newData, {
        where: {
          deleted: { [Op.eq]: false },
          localShippingId: { [Op.eq]: localShippingId }
        }
      })

      if (updatedRows === 0) {
        throw new AppError('Local shipping not found', StatusCodes.NOT_FOUND)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[LocalShippingService] update failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to update local shipping',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async remove(payload: IRemoveLocalShipping) {
    try {
      const [updatedRows] = await LocalShippingModel.update(
        { deleted: true },
        {
          where: {
            deleted: { [Op.eq]: false },
            localShippingId: { [Op.eq]: payload.localShippingId }
          }
        }
      )

      if (updatedRows === 0) {
        throw new AppError('Local shipping not found', StatusCodes.NOT_FOUND)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[LocalShippingService] remove failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to remove local shipping',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
