import { z } from 'zod'

export const findAllPromotionQuerySchema = z.object({
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
  productCategoryId: z.coerce.number().int().optional(),
  productSubCategoryId: z.coerce.number().int().optional()
})

export const updatePromotionSchema = z.object({
  products: z
    .array(
      z.object({
        productId: z.coerce
          .number({ invalid_type_error: 'productId harus berupa angka' })
          .int('productId harus bilangan bulat')
          .positive('productId harus lebih dari 0'),
        productIsHighlight: z.boolean({
          invalid_type_error: 'productIsHighlight harus boolean'
        })
      })
    )
    .min(1, 'Minimal satu produk')
})

export const removePromotionQuerySchema = z.object({
  productId: z.coerce
    .number({ invalid_type_error: 'productId harus berupa angka' })
    .int('productId harus bilangan bulat')
    .positive('productId harus lebih dari 0')
})

export type IFindAllPromotion = z.infer<typeof findAllPromotionQuerySchema>
export type IUpdatePromotion = z.infer<typeof updatePromotionSchema>
export type IRemovePromotion = z.infer<typeof removePromotionQuerySchema>
