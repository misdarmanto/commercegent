import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { FaqService } from '../../services/Faq.service'
import { type IUpdateFaq } from '../../schemas/faqSchema'

export const updateFaq = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as IUpdateFaq

    await FaqService.updateFaq(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: null }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
