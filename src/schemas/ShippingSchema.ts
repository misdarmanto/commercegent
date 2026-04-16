import { z } from 'zod'

export const getShippingRatesBodySchema = z
  .array(
    z.object({
      productVariantId: z.coerce
        .number({ invalid_type_error: 'productVariantId harus berupa angka' })
        .int('productVariantId harus bilangan bulat')
        .positive('productVariantId harus lebih dari 0'),
      quantity: z.coerce
        .number({ invalid_type_error: 'quantity harus berupa angka' })
        .int('quantity harus bilangan bulat')
        .min(1, 'quantity minimal 1')
    })
  )
  .min(1, 'Minimal satu item')

export const createShippingDraftBodySchema = z.object({
  userId: z.coerce
    .number({ invalid_type_error: 'userId harus berupa angka' })
    .int('userId harus bilangan bulat')
    .positive('userId harus lebih dari 0'),
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
