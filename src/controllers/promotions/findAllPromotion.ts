import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { PromotionService } from '../../services/Promotion.service'
import { type IFindAllPromotionQuery } from '../../schemas/PromotionSchema'

export const findAllPromotion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await PromotionService.findAllPromotions(
      req.query as unknown as IFindAllPromotionQuery
    )
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
