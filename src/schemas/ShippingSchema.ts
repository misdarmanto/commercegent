import { z } from 'zod'

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

export const createShippingDraftBodySchema = z.object({
  orderId: z.coerce
    .number({ invalid_type_error: 'orderId harus berupa angka' })
    .int('orderId harus bilangan bulat')
    .positive('orderId harus lebih dari 0')
})

export const confirmDraftOrderBodySchema = z.object({
  orderId: z.coerce
    .number({ invalid_type_error: 'orderId harus berupa angka' })
    .int('orderId harus bilangan bulat')
    .positive('orderId harus lebih dari 0')
})

export const trackShipmentQuerySchema = z.object({
  orderId: z.coerce
    .number({ invalid_type_error: 'orderId harus berupa angka' })
    .int('orderId harus bilangan bulat')
    .positive('orderId harus lebih dari 0')
})

export type IGetShippingRates = z.infer<typeof getShippingRatesBodySchema>
export type ICreateShippingDraft = z.infer<typeof createShippingDraftBodySchema>
export type IConfirmDraftOrder = z.infer<typeof confirmDraftOrderBodySchema>
export type ITrackShipment = z.infer<typeof trackShipmentQuerySchema>
