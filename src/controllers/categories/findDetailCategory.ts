import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { CategoryService } from '../../services/Category.service'
import { type IFindDetailCategoryParams } from '../../schemas/CategorySchema'

export const findDetailCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IFindDetailCategoryParams
    const result = await CategoryService.findDetailCategory(payload.categoryId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
