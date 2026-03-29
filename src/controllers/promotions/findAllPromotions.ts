import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { Pagination } from '../../utilities/pagination'
import { ProductModel } from '../../models/products'
import { CategoryModel } from '../../models/categories'
import { handleServerError } from '../../utilities/requestHandler'

export const findAllPromotion = async (req: any, res: Response): Promise<any> => {
  try {
    const page = new Pagination(
      parseInt(req.query.page) ?? 0,
      parseInt(req.query.size) ?? 10
    )

    const result = await ProductModel.findAndCountAll({
      where: {
        deleted: { [Op.eq]: 0 },
        productIsHighlight: true,
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
