import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { ProductModel } from '../models/ProductModel'
import { OrdersModel } from '../models/OrderModel'
import { UserModel } from '../models/UserModel'
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
}
