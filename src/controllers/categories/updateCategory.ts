import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CategoryService } from '../../services/Category.service'
import { type IUpdateCategoryBody } from '../../schemas/CategorySchema'

export const updateCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateCategoryBody
    const result = await CategoryService.updateCategory(payload)

    return res
      .status(StatusCodes.OK)
      .json(
        ResponseData.success({ data: result, message: 'Category updated successfully' })
      )
  } catch (error) {
    return handleError(res, error)
  }
}
