import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CategoryService } from '../../services/Category.service'
import { type IFindAllCategoryQuery } from '../../schemas/CategorySchema'

export const findAllCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const query = req.query as unknown as IFindAllCategoryQuery
    const result = await CategoryService.findAllCategories(query)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
