import { z } from 'zod'

/* ============================= */
/* MIDTRANS WEBHOOK (body) */
/* ============================= */

export const midtransWebhookBodySchema = z.object({
  order_id: z.string().min(1),
  transaction_status: z.string().min(1),
  status_code: z.union([z.string(), z.number()]).transform((v) => String(v)),
  gross_amount: z.union([z.string(), z.number()]).transform((v) => String(v)),
  payment_type: z.string().optional(),
  signature_key: z.string().min(1)
})

/* ============================= */
/* BITESHIP WEBHOOK (body) */
/* ============================= */

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

export type IMidtransWebhookBody = z.infer<typeof midtransWebhookBodySchema>
export type IBitshipWebhookBody = z.infer<typeof bitshipWebhookBodySchema>
