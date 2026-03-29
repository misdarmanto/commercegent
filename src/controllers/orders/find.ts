import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { Pagination } from '../../utilities/pagination'
import { requestChecker } from '../../utilities/requestCheker'
import { type OrdersAttributes, OrdersModel } from '../../models/orders'
import { ProductModel } from '../../models/products'
import { UserModel } from '../../models/user'
import { AddressesModel } from '../../models/address'
import { handleServerError } from '../../utilities/requestHandler'
import { OrderItemsModel } from '../../models/orderItems'

export const findAllOrder = async (req: any, res: Response): Promise<any> => {
  try {
    const user = await UserModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        userId: req.jwtPayload?.userId
      }
    })

    const page = new Pagination(
      parseInt(req.query.page) ?? 0,
      parseInt(req.query.size) ?? 10
    )

    const result = await OrdersModel.findAndCountAll({
      where: {
        deleted: { [Op.eq]: 0 },
        ...(Boolean(req.query.search) && {
          [Op.or]: [{ orderReferenceId: { [Op.like]: `%${req.query.search}%` } }]
        }),
        ...(Boolean(user?.dataValues.userRole === 'user') && {
          orderUserId: { [Op.eq]: req.jwtPayload?.userId }
        }),
        ...(Boolean(req.query?.orderStatus) && {
          orderStatus: { [Op.eq]: req.query.orderStatus }
        })
      },
      include: [
        {
          model: UserModel,
          where: {
            deleted: { [Op.eq]: 0 },
            ...(Boolean(req.query.search) && {
              [Op.or]: [{ userName: { [Op.like]: `%${req.query.search}%` } }]
            })
          },
          attributes: ['userName']
        },
        {
          model: OrderItemsModel,
          as: 'orderItems',
          include: [
            {
              model: ProductModel
            }
          ]
        }
      ],
      order: [['orderId', 'desc']],
      ...(req.query.pagination === 'true' && {
        limit: page.limit,
        offset: page.offset
      })
    })

    console.log('======order')

    const response = ResponseData.default
    response.data = page.data(result)
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}

export const findDetailOrder = async (req: any, res: Response): Promise<any> => {
  const requestParams = req.params as OrdersAttributes

  const emptyField = requestChecker({
    requireList: ['orderId'],
    requestData: requestParams
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    const result = await OrdersModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        orderId: { [Op.eq]: requestParams.orderId }
      },
      include: [
        {
          model: OrderItemsModel,
          as: 'orderItems',
          include: [
            {
              model: ProductModel
            }
          ]
        },
        {
          model: AddressesModel
        },
        {
          model: UserModel,
          where: {
            deleted: { [Op.eq]: 0 }
          },
          attributes: ['userName', 'userWhatsAppNumber', 'userCoin']
        }
      ]
    })

    const response = ResponseData.default
    response.data = result
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
