import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CategoryService } from '../../services/Category.service'
import { type IUpdateCategory } from '../../schemas/CategorySchema'

export const updateCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateCategory
    await CategoryService.updateCategory(payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Category updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
