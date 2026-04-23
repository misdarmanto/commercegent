import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { StatModel, type StatModelCreationAttributes } from '../models/StatModel'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type { ICreateStat, IUpdateStat } from '../schemas/StatSchema'

export class StatService {
  static async find() {
    try {
      const stat = await StatModel.findOne({
        where: { deleted: { [Op.eq]: false } },
        order: [['statId', 'asc']]
      })

      if (stat != null) return stat

      return await this.create({ statTotalVisit: 0 })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[StatService] find failed: ${String(serviceError)}`)
      throw new AppError('Failed to find stat', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async create(payload: ICreateStat) {
    try {
      const createPayload: StatModelCreationAttributes = {
        statTotalVisit: payload.statTotalVisit ?? 0,
        deleted: false
      }

      return await StatModel.create(createPayload)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[StatService] create failed: ${String(serviceError)}`)
      throw new AppError('Failed to create stat', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async update(payload: IUpdateStat) {
    try {
      const [updatedRows] = await StatModel.update(
        { statTotalVisit: payload.statTotalVisit },
        {
          where: {
            statId: { [Op.eq]: payload.statId },
            deleted: { [Op.eq]: false }
          }
        }
      )

      if (updatedRows === 0) {
        throw new AppError('Stat not found', StatusCodes.NOT_FOUND)
      }

      return await StatModel.findOne({
        where: {
          statId: { [Op.eq]: payload.statId },
          deleted: { [Op.eq]: false }
        }
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[StatService] update failed: ${String(serviceError)}`)
      throw new AppError('Failed to update stat', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
