import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { CartsModel, type CartsAttributes } from '../models/CartModel'
import { ProductModel } from '../models/ProductModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import {
  ICreateCart,
  IFindAllCarts,
  IRemoveCart,
  IUpdateCart
} from '../schemas/CartSchema'
import { ProductVariantModel } from '../models/ProductVariantModel'

export class CartService {
  private static buildFindAllWhere(
    userId: number,
    payload: IFindAllCarts
  ): WhereOptions<CartsAttributes> {
    const where: WhereOptions<CartsAttributes> = {
      deleted: { [Op.eq]: false },
      cartUserId: { [Op.eq]: userId }
    }

    return where
  }

  static async findAllCarts(userId: number, payload: IFindAllCarts) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await CartsModel.findAndCountAll({
        where: this.buildFindAllWhere(userId, payload),
        attributes: ['cartId', 'cartUserId', 'cartProductId', 'cartQuantity'],
        include: [
          {
            model: ProductModel,
            as: 'product',
            attributes: [
              'productId',
              'productName',
              'productCode',
              'productBarcode',
              'productUnit'
            ]
          },
          {
            model: ProductVariantModel,
            as: 'variant',
            attributes: [
              'productVariantId',
              'productVariantName',
              'productVariantImage',
              'productVariantPrice',
              'productVariantSellPrice',
              'productVariantDiscount',
              'productVariantStock',
              'productVariantWeight'
            ]
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

  static async findTotalCart(userId: number) {
    try {
      const result = await CartsModel.sum('cartQuantity', {
        where: {
          deleted: { [Op.eq]: false },
          cartUserId: { [Op.eq]: userId }
        }
      })

      if (result == null) {
        return { total: 0 }
      }

      return { total: result }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[CartService] findTotalCart failed: ${String(serviceError)}`)
      throw new AppError('Failed to find total cart', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async createCart(userId: number, payload: ICreateCart) {
    try {
      const existingCart = await CartsModel.findOne({
        where: {
          deleted: false,
          cartUserId: userId,
          cartProductId: payload.cartProductId,
          cartProductVariantId: payload.cartProductVariantId
        }
      })

      if (existingCart != null) {
        existingCart.cartQuantity += payload.cartQuantity
        await existingCart.save()
      } else {
        await CartsModel.create({
          cartProductId: payload.cartProductId,
          cartProductVariantId: payload.cartProductVariantId,
          cartQuantity: payload.cartQuantity,
          cartUserId: userId,
          deleted: false
        })
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[CartService] createCart failed: ${String(serviceError)}`)
      throw new AppError('Failed to create cart', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeCart(userId: number, payload: IRemoveCart) {
    try {
      const [updatedRows] = await CartsModel.update(
        { deleted: true },
        {
          where: {
            deleted: { [Op.eq]: false },
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

  static async updateCart(userId: number, payload: IUpdateCart) {
    try {
      const [updatedRows] = await CartsModel.update(
        { cartQuantity: payload.cartQuantity },
        {
          where: {
            deleted: { [Op.eq]: false },
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
      logger.error(`[CartService] updateCart failed: ${String(serviceError)}`)
      throw new AppError('Failed to update cart', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
