import { z } from 'zod'

export const midtransWebhookBodySchema = z.object({
  order_id: z.string().min(1),
  transaction_status: z.string().min(1),
  status_code: z.union([z.string(), z.number()]).transform((v) => String(v)),
  gross_amount: z.union([z.string(), z.number()]).transform((v) => String(v)),
  payment_type: z.string().optional(),
  signature_key: z.string().min(1)
})

export const bitshipWebhookBodySchema = z.object({
  event: z.string().optional(),
  order_id: z.string().optional(),
  order_price: z.number().optional(),
  courier_tracking_id: z.string().optional(),
  courier_waybill_id: z.string().min(1),
  courier_company: z.string().optional(),
  courier_type: z.string().optional(),
  status: z.string().optional()
})

export type IMidtransWebhook = z.infer<typeof midtransWebhookBodySchema>
export type IBitshipWebhook = z.infer<typeof bitshipWebhookBodySchema>
