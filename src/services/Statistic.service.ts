import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { ProductModel } from '../models/ProductModel'
import { OrdersModel } from '../models/OrderModel'
import { UserModel } from '../models/UserModel'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { VisitorModel, type VisitorModelCreationAttributes } from '../models/VisitorModel'
import type { ICreateVisitor, IFindTotalVisitor } from '../schemas/StatisticSchema'

export class StatisticService {
  private static readonly WIB_OFFSET_MS = 7 * 60 * 60 * 1000

  private static parseRangeMs(range: IFindTotalVisitor['range']): number {
    switch (range) {
      case '1d':
        return 24 * 60 * 60 * 1000
      case '7d':
        return 7 * 24 * 60 * 60 * 1000
      case '1m':
        return 30 * 24 * 60 * 60 * 1000
      case '3m':
        return 90 * 24 * 60 * 60 * 1000
      case '1y':
        return 365 * 24 * 60 * 60 * 1000
      default:
        return 24 * 60 * 60 * 1000
    }
  }

  private static parseIntervalMs(interval: IFindTotalVisitor['interval']): number {
    switch (interval) {
      case '1h':
        return 60 * 60 * 1000
      case '12h':
        return 12 * 60 * 60 * 1000
      case '1d':
        return 24 * 60 * 60 * 1000
      default:
        return 60 * 60 * 1000
    }
  }

  private static formatBucketLabel(
    date: Date,
    interval: IFindTotalVisitor['interval']
  ): string {
    const wibDate = new Date(date.getTime() + this.WIB_OFFSET_MS)
    const yyyy = wibDate.getUTCFullYear()
    const mm = String(wibDate.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(wibDate.getUTCDate()).padStart(2, '0')
    const hh = String(wibDate.getUTCHours()).padStart(2, '0')
    const mi = String(wibDate.getUTCMinutes()).padStart(2, '0')
    const ss = String(wibDate.getUTCSeconds()).padStart(2, '0')

    if (interval === '1d') return `${yyyy}-${mm}-${dd}`
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} WIB`
  }

  private static alignToWibBucketStart(nowMs: number, intervalMs: number): number {
    return (
      Math.floor((nowMs + this.WIB_OFFSET_MS) / intervalMs) * intervalMs -
      this.WIB_OFFSET_MS
    )
  }

  static async findTotal() {
    try {
      const [
        totalProduct,
        totalOrder,
        totalTransaction,
        totalCustomer,
        totalUserPria,
        totalUserWanita
      ] = await Promise.all([
        ProductModel.count({
          where: { deleted: { [Op.eq]: false } }
        }),
        OrdersModel.count({
          where: { deleted: { [Op.eq]: false }, orderStatus: { [Op.not]: 'done' } }
        }),
        OrdersModel.count({
          where: { deleted: { [Op.eq]: false }, orderStatus: { [Op.eq]: 'done' } }
        }),
        UserModel.count({
          where: { deleted: { [Op.eq]: false }, userRole: { [Op.eq]: 'user' } }
        }),
        UserModel.count({
          where: {
            deleted: { [Op.eq]: false },
            userGender: { [Op.eq]: 'pria' },
            userRole: { [Op.eq]: 'user' }
          }
        }),
        UserModel.count({
          where: {
            deleted: { [Op.eq]: false },
            userGender: { [Op.eq]: 'wanita' },
            userRole: { [Op.eq]: 'user' }
          }
        })
      ])

      return {
        totalProduct,
        totalOrder,
        totalTransaction,
        totalCustomer,
        totalUserPria,
        totalUserWanita
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[StatisticService] findTotal failed: ${String(serviceError)}`)
      throw new AppError('Failed to get statistic', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findTotalVisitor(payload: IFindTotalVisitor) {
    try {
      const rangeMs = this.parseRangeMs(payload.range)
      const intervalMs = this.parseIntervalMs(payload.interval)
      if (rangeMs % intervalMs !== 0) {
        throw new AppError(
          'Kombinasi range dan interval tidak valid',
          StatusCodes.BAD_REQUEST
        )
      }

      const nowMs = Date.now()
      const endBucketStartMs = this.alignToWibBucketStart(nowMs, intervalMs)
      const bucketCount = Math.floor(rangeMs / intervalMs)
      const startBucketStartMs = endBucketStartMs - (bucketCount - 1) * intervalMs
      const from = new Date(startBucketStartMs)

      const visitors = await VisitorModel.findAll({
        where: {
          deleted: { [Op.eq]: false },
          createdAt: {
            [Op.gte]: from,
            [Op.lte]: new Date(endBucketStartMs + intervalMs - 1)
          }
        },
        attributes: ['visitorId', 'createdAt'],
        order: [['createdAt', 'asc']]
      })

      const bucketCounter = new Map<string, number>()
      for (let i = 0; i < bucketCount; i++) {
        const bucketMs = startBucketStartMs + i * intervalMs
        const bucketDate = new Date(bucketMs)
        const bucketKey = this.formatBucketLabel(bucketDate, payload.interval)
        bucketCounter.set(bucketKey, 0)
      }

      for (const visitor of visitors) {
        const createdAt = visitor.createdAt ?? null
        if (createdAt == null) continue
        const createdAtMs = new Date(createdAt).getTime()
        const bucketMs =
          Math.floor((createdAtMs - startBucketStartMs) / intervalMs) * intervalMs +
          startBucketStartMs
        const bucketKey = this.formatBucketLabel(new Date(bucketMs), payload.interval)
        if (bucketCounter.has(bucketKey)) {
          bucketCounter.set(bucketKey, (bucketCounter.get(bucketKey) ?? 0) + 1)
        }
      }

      return Array.from(bucketCounter.entries()).map(([date, total]) => ({
        date,
        total
      }))
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[StatisticService] findTotalVisitor failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to find total visitor',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async createVisitor(payload: ICreateVisitor) {
    try {
      const createPayload: VisitorModelCreationAttributes = {
        deleted: false,
        visitorMeta: payload.visitorMeta
      }

      return await VisitorModel.create(createPayload)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[StatisticService] createVisitor failed: ${String(serviceError)}`)
      throw new AppError('Failed to create visitor', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
