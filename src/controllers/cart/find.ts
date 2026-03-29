import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { Pagination } from '../../utilities/pagination'
import { requestChecker } from '../../utilities/requestCheker'
import { type CartsAttributes, CartsModel } from '../../models/carts'
import { ProductModel } from '../../models/products'
import { handleServerError } from '../../utilities/requestHandler'

export const findAllCart = async (req: any, res: Response): Promise<any> => {
  try {
    const page = new Pagination(
      parseInt(req.query.page) ?? 0,
      parseInt(req.query.size) ?? 10
    )
    const result = await CartsModel.findAndCountAll({
      where: {
        deleted: { [Op.eq]: 0 },
        cartUserId: { [Op.eq]: req.jwtPayload?.userId },
        ...(Boolean(req.query.search) && {
          [Op.or]: [{ cartProductId: { [Op.like]: `%${req.query.search}%` } }]
        })
      },
      include: [
        {
          model: ProductModel
        }
      ],
      order: [['cartId', 'desc']],
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
