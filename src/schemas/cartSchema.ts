import { z } from 'zod'

export const createCartSchema = z.object({
  cartProductId: z.coerce
    .number({ invalid_type_error: 'cartProductId harus berupa angka' })
    .int('cartProductId harus bilangan bulat')
    .positive('cartProductId harus lebih dari 0'),

  cartProductVariantId: z.coerce
    .number({ invalid_type_error: 'cartProductVariantId harus berupa angka' })
    .int('cartProductVariantId harus bilangan bulat')
    .positive('cartProductVariantId harus lebih dari 0'),

  cartQuantity: z.coerce
    .number({ invalid_type_error: 'cartQuantity harus berupa angka' })
    .int('cartQuantity harus bilangan bulat')
    .min(1, 'cartQuantity minimal 1')
})

export const removeCartQuerySchema = z.object({
  cartId: z.coerce
    .number({ invalid_type_error: 'cartId harus berupa angka' })
    .int('cartId harus bilangan bulat')
    .positive('cartId harus lebih dari 0')
})

export const findAllCartSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  search: z
    .union([z.string(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true')
})

export const updateCartSchema = z.object({
  cartId: z.coerce
    .number({ invalid_type_error: 'cartId harus berupa angka' })
    .int('cartId harus bilangan bulat')
    .positive('cartId harus lebih dari 0'),
  cartQuantity: z.coerce
    .number({ invalid_type_error: 'cartQuantity harus berupa angka' })
    .int('cartQuantity harus bilangan bulat')
    .min(1, 'cartQuantity minimal 1')
})

export type ICreateCart = z.infer<typeof createCartSchema>
export type IRemoveCart = z.infer<typeof removeCartQuerySchema>
export type IFindAllCarts = z.infer<typeof findAllCartSchema>
export type IUpdateCart = z.infer<typeof updateCartSchema>
