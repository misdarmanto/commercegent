import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AppLogModel, IAppLogAttributes } from '../models/AppLogModel'
import { Pagination } from '../utilities/pagination'
import logger from '../utilities/logger'
import { AppError } from '../utilities/appError'
import { ICreateAppLog, IFindAllAppLogs } from '../schemas/AppLogSchema'

export class AppLogService {
  private static buildFindAllWhere(
    payload: IFindAllAppLogs
  ): WhereOptions<IAppLogAttributes> {
    const where: WhereOptions<IAppLogAttributes> = {
      deleted: { [Op.eq]: false }
    }

    if (payload.level != null) {
      where.appLogLevel = payload.level
    }

    if (payload.search != null) {
      where.appLogMessage = { [Op.like]: `%${payload.search.trim()}%` }
    }

    return where
  }

  static async findAll(payload: IFindAllAppLogs) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await AppLogModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        order: [['appLogId', 'DESC']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AppLogService] findAll failed: ${String(serviceError)}`)
      throw new AppError('Failed to find logs', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async create(payload: ICreateAppLog) {
    try {
      const result = await AppLogModel.create({
        appLogLevel: payload.appLogLevel,
        appLogMessage: payload.appLogMessage,
        appLogSource: payload.appLogSource ?? null,
        appLogMeta: payload.appLogMeta ?? null
      })
      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AppLogService] create failed: ${String(serviceError)}`)
      throw new AppError('Failed to create log', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
