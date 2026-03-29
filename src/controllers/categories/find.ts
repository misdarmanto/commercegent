import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { Pagination } from '../../utilities/pagination'
import { requestChecker } from '../../utilities/requestCheker'
import { CategoryAttributes, CategoryModel } from '../../models/categories'
import { handleServerError } from '../../utilities/requestHandler'

export const findAllCategory = async (req: any, res: Response): Promise<any> => {
  try {
    const page = new Pagination(
      parseInt(req.query.page) ?? 0,
      parseInt(req.query.size) ?? 10
    )
    const result = await CategoryModel.findAndCountAll({
      where: {
        deleted: { [Op.eq]: 0 },
        ...(Boolean(req.query.search) && {
          [Op.or]: [{ categoryName: { [Op.like]: `%${req.query.search}%` } }]
        }),
        ...(Boolean(req.query.categoryReference) && {
          categoryReference: req?.query?.categoryReference
        }),
        ...(Boolean(req.query.categoryType) && {
          categoryType: req?.query?.categoryType
        })
      },
      order: [['categoryId', 'desc']],
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

export const findDetailCategory = async (req: any, res: Response): Promise<any> => {
  const requestParams = req.params as CategoryAttributes

  const emptyField = requestChecker({
    requireList: ['categoryId'],
    requestData: requestParams
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    const result = await CategoryModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        categoryId: { [Op.eq]: requestParams.categoryId }
      }
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
