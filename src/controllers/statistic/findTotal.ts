import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { ProductModel } from '../../models/products'
import { OrdersModel } from '../../models/orders'
import { UserModel } from '../../models/user'
import { handleServerError } from '../../utilities/requestHandler'

export const findTotal = async (req: any, res: Response): Promise<any> => {
  try {
    const totalProduct = await ProductModel.count({
      where: {
        deleted: { [Op.eq]: 0 }
      }
    })

    const totalOrder = await OrdersModel.count({
      where: {
        deleted: { [Op.eq]: 0 },
        orderStatus: { [Op.not]: 'done' }
      }
    })

    const totalTransaction = await OrdersModel.count({
      where: {
        deleted: { [Op.eq]: 0 },
        orderStatus: { [Op.eq]: 'done' }
      }
    })

    const totalCustomer = await UserModel.count({
      where: {
        deleted: { [Op.eq]: 0 },
        userRole: { [Op.eq]: 'user' }
      }
    })

    const totalUserPria = await UserModel.count({
      where: {
        deleted: { [Op.eq]: 0 },
        userGender: { [Op.eq]: 'pria' },
        userRole: { [Op.eq]: 'user' }
      }
    })

    const totalUserWanita = await UserModel.count({
      where: {
        deleted: { [Op.eq]: 0 },
        userGender: { [Op.eq]: 'wanita' },
        userRole: { [Op.eq]: 'user' }
      }
    })

    const response = ResponseData.default

    response.data = {
      totalProduct,
      totalOrder,
      totalTransaction,
      totalCustomer,
      totalUserPria,
      totalUserWanita
    }
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
