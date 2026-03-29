import { Router } from 'express'
import { WebhookController } from '../controllers/webhook'

const WebhookRouter = Router()

WebhookRouter.post('/midtrans', WebhookController.midtransWebhookHandler)
WebhookRouter.post('/bitships', WebhookController.bitshipWebhookHandler)

export default WebhookRouter
