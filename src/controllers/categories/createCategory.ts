import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CategoryService } from '../../services/Category.service'
import { type ICreateCategoryBody } from '../../schemas/CategorySchema'

export const createCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateCategoryBody
    const result = await CategoryService.createCategory(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(
        ResponseData.success({ data: result, message: 'Category created successfully' })
      )
  } catch (error) {
    return handleError(res, error)
  }
}
