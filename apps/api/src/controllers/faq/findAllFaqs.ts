import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { FaqService } from '../../services/Faq.service'
import { type IFindAllFaqs } from '../../schemas/faqSchema'

export const findAllFaqs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllFaqs

    const result = await FaqService.findAllFaqs(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
