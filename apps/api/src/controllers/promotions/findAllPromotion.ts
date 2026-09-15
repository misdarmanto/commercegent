import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { PromotionService } from '../../services/Promotion.service'
import { type IFindAllPromotion } from '../../schemas/PromotionSchema'

export const findAllPromotion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllPromotion

    const result = await PromotionService.findAllPromotions(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
