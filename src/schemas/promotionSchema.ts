import { z } from 'zod'

export const updatePromotionSchema = z.object({
  products: z
    .array(
      z.object({
        productId: z.number(),
        productIsHighlight: z.boolean()
      })
    )
    .min(1)
})

export const removePromotionSchema = z.object({
  productId: z.coerce.number()
})
