import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CategoryService } from '../../services/Category.service'
import { type IRemoveCategory } from '../../schemas/CategorySchema'

export const removeCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.query as unknown as IRemoveCategory
    await CategoryService.removeCategory(payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Category removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
