import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CategoryService } from '../../services/Category.service'
import { type IFindAllCategories } from '../../schemas/CategorySchema'

export const findAllCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllCategories
    const result = await CategoryService.findAllCategories(payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
