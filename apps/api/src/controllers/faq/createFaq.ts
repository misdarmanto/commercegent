import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { FaqService } from '../../services/Faq.service'
import { type ICreateFaq } from '../../schemas/faqSchema'

export const createFaq = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as ICreateFaq

    await FaqService.createFaq(payload)
    return res.status(StatusCodes.CREATED).json(ResponseData.success({ data: null }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
