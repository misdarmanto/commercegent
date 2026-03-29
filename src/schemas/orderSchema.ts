import { z } from 'zod'
import { jwtPayloadSchema } from './jwtPayloadSchema'
import { orderItemSchema } from './orderItemSchema'

const courierField = z.union([
  z.string().max(50, 'Kode kurir maksimal 50 karakter'),
  z.null(),
  z.literal('')
])

export const createOrderSchema = z.object({
  jwtPayload: jwtPayloadSchema,

  orderShippingFee: z
    .number({ invalid_type_error: 'Ongkos kirim harus berupa angka' })
    .min(0, 'Ongkos kirim tidak boleh negatif'),

  orderCourierCompany: courierField,
  orderCourierType: courierField,

  items: z.array(orderItemSchema).min(1, 'Minimal 1 item harus dipesan')
})

export const createDraftFromOrderSchema = z.object({
  user: jwtPayloadSchema,
  orderId: z.coerce.number().int()
})

export const confirmDraftOrderSchema = z.object({
  user: jwtPayloadSchema,
  orderId: z.coerce.number().int().positive('orderId harus lebih dari 0')
})

export const trackOrderSchema = z.object({
  user: jwtPayloadSchema,
  orderId: z.coerce.number().int().positive('orderId harus lebih dari 0')
})
