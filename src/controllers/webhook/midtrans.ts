import { type Request, type Response } from 'express'
import { ResponseData } from '../../utilities/response'
import { StatusCodes } from 'http-status-codes'
import { handleError } from '../../utilities/requestHandler'
import { WebhookService } from '../../services/Webhook.service'
import { type IMidtransWebhookBody } from '../../schemas/WebhookSchema'

export const midtransWebhookHandler = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IMidtransWebhookBody
    const result = await WebhookService.handleMidtransWebhook(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
