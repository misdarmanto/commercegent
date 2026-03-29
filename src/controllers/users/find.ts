import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { requestChecker } from '../../utilities/requestCheker'
import { type UserAttributes, UserModel } from '../../models/user'
import { Pagination } from '../../utilities/pagination'
import { handleServerError } from '../../utilities/requestHandler'

export const findAllUser = async (req: any, res: Response): Promise<any> => {
  try {
    const page = new Pagination(
      parseInt(req.query.page) ?? 0,
      parseInt(req.query.size) ?? 10
    )
    const users = await UserModel.findAndCountAll({
      where: {
        deleted: { [Op.eq]: 0 },
        userRole: { [Op.eq]: 'user' },
        ...(Boolean(req.query.search) && {
          [Op.or]: [
            { userName: { [Op.like]: `%${req.query.search}%` } },
            { userEmail: { [Op.like]: `%${req.query.search}%` } },
            { userPartnerCode: { [Op.like]: `%${req.query.search}%` } }
          ]
        })
      },
      attributes: [
        'userId',
        'userName',
        'userWhatsAppNumber',
        'userCoin',
        'userRole',
        'userPartnerCode',
        'createdAt',
        'updatedAt'
      ],
      order: [['userId', 'desc']],
      ...(req.query.pagination === 'true' && {
        limit: page.limit,
        offset: page.offset
      })
    })
    const response = ResponseData.default
    response.data = page.data(users)

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}

export const findDetailUser = async (req: any, res: Response): Promise<any> => {
  const requestParams = req.params as UserAttributes
  const emptyField = requestChecker({
    requireList: ['userId'],
    requestData: requestParams
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    const user = await UserModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        userRole: { [Op.eq]: 'user' },
        userId: { [Op.eq]: requestParams.userId }
      },
      attributes: [
        'userId',
        'userName',
        'userWhatsAppNumber',
        'userCoin',
        'userRole',
        'userPartnerCode',
        'createdAt',
        'updatedAt'
      ]
    })

    if (user == null) {
      const message = 'user not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.FORBIDDEN).json(response)
    }

    const response = ResponseData.default
    response.data = user

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
