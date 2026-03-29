import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { Pagination } from '../../utilities/pagination'
import { requestChecker } from '../../utilities/requestCheker'
import { type TransactionsAttributes, TransactionsModel } from '../../models/transactions'
import { UserModel } from '../../models/user'
import { OrdersModel } from '../../models/orders'
import { handleServerError } from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared'

export const findAllTransaction = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userRole = await UserModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        userId: req.jwtPayload?.userId
      }
    })

    const page = new Pagination(Number(req.query.page) ?? 0, Number(req.query.size) ?? 10)

    console.log(page)

    const result = await TransactionsModel.findAndCountAll({
      where: {
        ...(Boolean(userRole?.dataValues.userRole === 'user') && {
          transactionUserId: { [Op.eq]: req.jwtPayload?.userId }
        }),
        deleted: { [Op.eq]: 0 },
        ...(Boolean(req.query.search) && {
          [Op.or]: [{ transactionId: { [Op.like]: `%${req.query.search}%` } }]
        })
      },
      include: [
        {
          model: UserModel,
          attributes: ['userId', 'userName']
        },
        { model: OrdersModel }
      ],
      order: [['transactionId', 'desc']],
      ...(req.query.pagination === 'true' && {
        limit: page.limit,
        offset: page.offset
      })
    })

    const response = ResponseData.default
    response.data = page.data(result)
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}

export const findDetailTransaction = async (req: any, res: Response): Promise<any> => {
  const requestParams = req.params as TransactionsAttributes

  const emptyField = requestChecker({
    requireList: ['transactionId'],
    requestData: requestParams
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    const result = await TransactionsModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        transactionId: { [Op.eq]: requestParams.transactionId }
      },
      include: [
        {
          model: UserModel,
          attributes: ['userId', 'userName', 'userPhoto']
        },
        { model: OrdersModel }
      ]
    })

    if (result == null) {
      const message = 'not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    const response = ResponseData.default
    response.data = result
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
