import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { ProductModel } from '../models/products'
import { OrdersModel } from '../models/orders'
import { UserModel } from '../models/user'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'

export class StatisticService {
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
          where: { deleted: { [Op.eq]: 0 } }
        }),
        OrdersModel.count({
          where: { deleted: { [Op.eq]: 0 }, orderStatus: { [Op.not]: 'done' } }
        }),
        OrdersModel.count({
          where: { deleted: { [Op.eq]: 0 }, orderStatus: { [Op.eq]: 'done' } }
        }),
        UserModel.count({
          where: { deleted: { [Op.eq]: 0 }, userRole: { [Op.eq]: 'user' } }
        }),
        UserModel.count({
          where: {
            deleted: { [Op.eq]: 0 },
            userGender: { [Op.eq]: 'pria' },
            userRole: { [Op.eq]: 'user' }
          }
        }),
        UserModel.count({
          where: {
            deleted: { [Op.eq]: 0 },
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
}
