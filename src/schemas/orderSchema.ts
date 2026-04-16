import { z } from 'zod'

/* ============================= */
/* ORDER ITEM (nested in body) */
/* ============================= */

export const orderItemSchema = z.object({
  productId: z
    .number({ invalid_type_error: 'Product ID harus berupa angka' })
    .min(0, 'Product ID tidak boleh negatif'),
  productVariantId: z
    .number({ invalid_type_error: 'Product VariantID harus berupa angka' })
    .min(0, 'Product ID tidak boleh negatif'),
  quantity: z
    .number({ invalid_type_error: 'Quantity harus berupa angka' })
    .int('Quantity harus bilangan bulat')
    .min(1, 'Quantity minimal 1')
})

const courierField = z.union([
  z.string().max(50, 'Kode kurir maksimal 50 karakter'),
  z.null(),
  z.literal('')
])

/* ============================= */
/* CREATE ORDER (body) */
/* ============================= */

export const createOrderSchema = z.object({
  orderShippingFee: z
    .number({ invalid_type_error: 'Ongkos kirim harus berupa angka' })
    .min(0, 'Ongkos kirim tidak boleh negatif'),

  orderCourierCompany: courierField,
  orderCourierType: courierField,

  items: z.array(orderItemSchema).min(1, 'Minimal 1 item harus dipesan')
})

/* ============================= */
/* FIND ALL ORDERS (query) */
/* ============================= */

export const findAllOrderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(10),
  search: z
    .union([z.string(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  orderStatus: z
    .enum(['waiting', 'process', 'draft', 'delivery', 'done', 'cancel'])
    .optional()
})

export const orderDetailParamsSchema = z.object({
  orderId: z.coerce
    .number({ invalid_type_error: 'orderId harus berupa angka' })
    .int('orderId harus bilangan bulat')
    .positive('orderId harus lebih dari 0')
})

export const updateOrderBodySchema = z.object({
  orderId: z.coerce
    .number({ invalid_type_error: 'orderId harus berupa angka' })
    .int('orderId harus bilangan bulat')
    .positive('orderId harus lebih dari 0')
})

export const createDraftFromOrderSchema = z.object({
  orderId: z.coerce.number().int().positive('orderId harus lebih dari 0')
})

export const confirmDraftOrderSchema = z.object({
  orderId: z.coerce.number().int().positive('orderId harus lebih dari 0')
})

export const trackOrderSchema = z.object({
  orderId: z.coerce.number().int().positive('orderId harus lebih dari 0')
})

export type ICreateOrder = z.infer<typeof createOrderSchema>
export type IFindAllOrder = z.infer<typeof findAllOrderQuerySchema>
export type IFindDetailOrder = z.infer<typeof orderDetailParamsSchema>
export type IUpdateOrder = z.infer<typeof updateOrderBodySchema>
export type ICreateDraftFromOrder = z.infer<typeof createDraftFromOrderSchema>
export type IConfirmDraftOrder = z.infer<typeof confirmDraftOrderSchema>
export type ITrackOrder = z.infer<typeof trackOrderSchema>
