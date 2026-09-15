import { bitshipWebhookHandler } from './bitship'
import { midtransWebhookHandler } from './midtrans'

export const WebhookController = {
  midtransWebhookHandler,
  bitshipWebhookHandler
}
