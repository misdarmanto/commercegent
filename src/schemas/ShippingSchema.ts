import { z } from 'zod'

/* ============================= */
/* GET SHIPPING RATES (body) */
/* ============================= */

export const getShippingRatesBodySchema = z
  .array(
    z.object({
      productId: z.coerce
        .number({ invalid_type_error: 'productId harus berupa angka' })
        .int('productId harus bilangan bulat')
        .positive('productId harus lebih dari 0'),
      quantity: z.coerce
        .number({ invalid_type_error: 'quantity harus berupa angka' })
        .int('quantity harus bilangan bulat')
        .min(1, 'quantity minimal 1')
    })
  )
  .min(1, 'Minimal satu item')

/* ============================= */
/* CREATE DRAFT (body) */
/* ============================= */

export const createShippingDraftBodySchema = z.object({
  orderId: z.coerce
    .number({ invalid_type_error: 'orderId harus berupa angka' })
    .int('orderId harus bilangan bulat')
    .positive('orderId harus lebih dari 0')
})

/* ============================= */
/* CONFIRM DRAFT (body) */
/* ============================= */

export const confirmDraftOrderBodySchema = z.object({
  orderId: z.coerce
    .number({ invalid_type_error: 'orderId harus berupa angka' })
    .int('orderId harus bilangan bulat')
    .positive('orderId harus lebih dari 0')
})

/* ============================= */
/* TRACKING (query) */
/* ============================= */

export const trackShipmentQuerySchema = z.object({
  orderId: z.coerce
    .number({ invalid_type_error: 'orderId harus berupa angka' })
    .int('orderId harus bilangan bulat')
    .positive('orderId harus lebih dari 0')
})

export type IGetShippingRatesBody = z.infer<typeof getShippingRatesBodySchema>
export type ICreateShippingDraftBody = z.infer<typeof createShippingDraftBodySchema>
export type IConfirmDraftOrderBody = z.infer<typeof confirmDraftOrderBodySchema>
export type ITrackShipmentQuery = z.infer<typeof trackShipmentQuerySchema>
