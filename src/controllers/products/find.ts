import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { Pagination } from '../../utilities/pagination'
import { requestChecker } from '../../utilities/requestCheker'
import { type ProductAttributes, ProductModel } from '../../models/products'
import { CategoryModel } from '../../models/categories'
import { handleServerError } from '../../utilities/requestHandler'

export const findAllProducts = async (req: any, res: Response): Promise<any> => {
  try {
    const page = new Pagination(
      parseInt(req.query.page) ?? 0,
      parseInt(req.query.size) ?? 10
    )

    const result = await ProductModel.findAndCountAll({
      where: {
        deleted: { [Op.eq]: 0 },
        productIsVisible: { [Op.eq]: true },
        ...(Boolean(req.query.search) && {
          [Op.or]: [{ productName: { [Op.like]: `%${req.query.search}%` } }]
        }),
        ...(Boolean(req.query.productCategoryId) && {
          productCategoryId: { [Op.eq]: req.query.productCategoryId }
        }),
        ...(Boolean(req.query.productSubCategoryId) && {
          productSubCategoryId: { [Op.eq]: req.query.productSubCategoryId }
        })
      },
      include: [{ model: CategoryModel }],
      order: [['productId', 'desc']],
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

export const findDetailProduct = async (req: any, res: Response): Promise<any> => {
  const requestParams = req.params as ProductAttributes

  const emptyField = requestChecker({
    requireList: ['productId'],
    requestData: requestParams
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    const result = await ProductModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        productId: { [Op.eq]: requestParams.productId }
      },
      include: [{ model: CategoryModel }]
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
