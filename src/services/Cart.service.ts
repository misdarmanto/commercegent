import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { CartsModel } from '../models/carts'
import { ProductModel } from '../models/products'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import { ICreateCart, IFindAllCarts, IRemoveCart } from '../schemas/CartSchema'

type FindAllCartsWhere = {
  deleted: { [Op.eq]: number }
  cartUserId: { [Op.eq]: number }
  [Op.or]?: Array<{ cartProductId: { [Op.like]: string } }>
}

export class CartService {
  private static buildFindAllWhere(
    userId: number,
    payload: IFindAllCarts
  ): FindAllCartsWhere {
    const where: FindAllCartsWhere = {
      deleted: { [Op.eq]: 0 },
      cartUserId: { [Op.eq]: userId }
    }

    if (payload.search != null) {
      where[Op.or] = [{ cartProductId: { [Op.like]: `%${payload.search}%` } }]
    }

    return where
  }

  static async findAllCarts(userId: number, payload: IFindAllCarts) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await CartsModel.findAndCountAll({
        where: this.buildFindAllWhere(userId, payload),
        include: [
          {
            model: ProductModel
          }
        ],
        order: [['cartId', 'desc']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[CartService] findAllCarts failed: ${String(serviceError)}`)
      throw new AppError('Failed to find carts', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createCart(userId: number, payload: ICreateCart) {
    try {
      const existingCart = await CartsModel.findOne({
        where: {
          deleted: 0,
          cartUserId: userId,
          cartProductId: payload.cartProductId
        }
      })

      if (existingCart != null) {
        existingCart.cartTotalItem += payload.cartTotalItem
        await existingCart.save()
      }

      await CartsModel.create({
        cartProductId: payload.cartProductId,
        cartTotalItem: payload.cartTotalItem,
        cartUserId: userId,
        deleted: 0
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[CartService] createCart failed: ${String(serviceError)}`)
      throw new AppError('Failed to create cart', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeCart(userId: number, payload: IRemoveCart) {
    try {
      const [updatedRows] = await CartsModel.update(
        { deleted: 1 },
        {
          where: {
            deleted: { [Op.eq]: 0 },
            cartId: { [Op.eq]: payload.cartId },
            cartUserId: { [Op.eq]: userId }
          }
        }
      )

      if (updatedRows === 0) {
        throw new AppError('cart not found!', StatusCodes.NOT_FOUND)
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[CartService] removeCart failed: ${String(serviceError)}`)
      throw new AppError('Failed to remove cart', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
