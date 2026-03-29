import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CategoryService } from '../../services/Category.service'
import { type IRemoveCategoryQuery } from '../../schemas/CategorySchema'

export const removeCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const query = req.query as unknown as IRemoveCategoryQuery
    const result = await CategoryService.removeCategory(query.categoryId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
