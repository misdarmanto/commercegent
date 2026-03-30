import { Router } from 'express'
import { WebhookController } from '../controllers/webhook'
import { MiddleWares } from '../middlewares'
import {
  bitshipWebhookBodySchema,
  midtransWebhookBodySchema
} from '../schemas/WebhookSchema'

const WebhookRouter = Router()

WebhookRouter.post(
  '/midtrans',
  MiddleWares.validate({ body: midtransWebhookBodySchema }),
  WebhookController.midtransWebhookHandler
)
WebhookRouter.post(
  '/bitships',
  MiddleWares.validate({ body: bitshipWebhookBodySchema }),
  WebhookController.bitshipWebhookHandler
)

export default WebhookRouter
