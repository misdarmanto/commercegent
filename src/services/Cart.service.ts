import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { CartsModel } from '../models/carts'
import { ProductModel } from '../models/products'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { ICreateCartBody, IFindAllCartQuery } from '../schemas/cartSchema'

export class CartService {
  static async createCart(userId: number, body: ICreateCartBody) {
    try {
      const existingCart = await CartsModel.findOne({
        where: {
          deleted: 0,
          cartUserId: userId,
          cartProductId: body.cartProductId
        }
      })

      if (existingCart != null) {
        existingCart.cartTotalItem += body.cartTotalItem
        await existingCart.save()
        return { message: 'success' as const }
      }

      await CartsModel.create({
        cartProductId: body.cartProductId,
        cartTotalItem: body.cartTotalItem,
        cartUserId: userId,
        deleted: 0
      })

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[CartService] createCart failed: ${String(error)}`)
      throw new AppError('Failed to update cart', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeCart(userId: number, cartId: number) {
    try {
      const row = await CartsModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          cartId: { [Op.eq]: cartId },
          cartUserId: { [Op.eq]: userId }
        }
      })

      if (row == null) {
        throw new AppError('cart not found!', StatusCodes.NOT_FOUND)
      }

      row.deleted = 1
      await row.save()

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[CartService] removeCart failed: ${String(error)}`)
      throw new AppError('Failed to remove cart', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAllCarts(userId: number, query: IFindAllCartQuery) {
    try {
      const page = new Pagination(query.page, query.size)

      const result = await CartsModel.findAndCountAll({
        where: {
          deleted: { [Op.eq]: 0 },
          cartUserId: { [Op.eq]: userId },
          ...(Boolean(query.search) && {
            [Op.or]: [{ cartProductId: { [Op.like]: `%${query.search}%` } }]
          })
        },
        include: [
          {
            model: ProductModel
          }
        ],
        order: [['cartId', 'desc']],
        ...(query.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[CartService] findAllCarts failed: ${String(error)}`)
      throw new AppError('Failed to fetch cart', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
