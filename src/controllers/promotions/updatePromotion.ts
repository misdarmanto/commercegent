import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { PromotionService } from '../../services/Promotion.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IUpdatePromotionBody } from '../../schemas/PromotionSchema'

export const updatePromotion = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdatePromotionBody
    const result = await PromotionService.updateHighlights(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
