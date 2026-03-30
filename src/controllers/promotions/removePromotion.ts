import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { PromotionService } from '../../services/Promotion.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IRemovePromotionQuery } from '../../schemas/PromotionSchema'

export const removePromotion = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const query = req.query as unknown as IRemovePromotionQuery
    const result = await PromotionService.removeProductHighlight(query)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
