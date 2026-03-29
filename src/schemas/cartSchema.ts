import { z } from 'zod'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const createCartSchema = z.object({
  cartProductId: z.coerce
    .number({ invalid_type_error: 'cartProductId harus berupa angka' })
    .int('cartProductId harus bilangan bulat')
    .positive('cartProductId harus lebih dari 0'),

  cartTotalItem: z.coerce
    .number({ invalid_type_error: 'cartTotalItem harus berupa angka' })
    .int('cartTotalItem harus bilangan bulat')
    .min(1, 'cartTotalItem minimal 1')
})

export const removeCartSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  cartId: z.coerce
    .number({ invalid_type_error: 'cartId harus berupa angka' })
    .int('cartId harus bilangan bulat')
    .positive('cartId harus lebih dari 0')
})

export const findDetailCartSchema = z.object({
  jwtPayload: jwtPayloadSchema
})

export const findAllCartSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  page: z.number().int().optional(),
  size: z.number().int().optional(),
  search: z.string().optional(),
  pagination: z.boolean().optional()
})
