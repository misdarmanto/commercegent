import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { PromotionService } from '../../services/Promotion.service'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { type IRemovePromotion } from '../../schemas/promotionSchema'

export const removePromotion = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IRemovePromotion

    await PromotionService.removeProductHighlight(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Promotion removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
