import { z } from 'zod'

export const findAllLocalShippingSchema = z.object({
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

export const createLocalShippingSchema = z.object({
  localShippingCompanyName: z.string().min(2).max(120),
  localShippingProvinceName: z.string().min(2).max(120),
  localShippingProvinceId: z.string().min(1).max(120),
  localShippingPricePerKg: z.coerce.number().int().min(0),
  localShippingDuration: z.string().min(1).max(120)
})

export const updateLocalShippingSchema = z
  .object({
    localShippingId: z.coerce.number().int().positive(),
    localShippingCompanyName: z.string().min(2).max(120).optional(),
    localShippingProvinceName: z.string().min(2).max(120).optional(),
    localShippingProvinceId: z.string().min(1).max(120).optional(),
    localShippingPricePerKg: z.coerce.number().int().min(0).optional(),
    localShippingDuration: z.string().min(1).max(120).optional()
  })
  .strict()

export const findDetailLocalShippingSchema = z.object({
  localShippingId: z.coerce.number().int().positive()
})

export const removeLocalShippingSchema = z.object({
  localShippingId: z.coerce.number().int().positive()
})

export type IFindAllLocalShipping = z.infer<typeof findAllLocalShippingSchema>
export type ICreateLocalShipping = z.infer<typeof createLocalShippingSchema>
export type IUpdateLocalShipping = z.infer<typeof updateLocalShippingSchema>
export type IDetailLocalShipping = z.infer<typeof findDetailLocalShippingSchema>
export type IRemoveLocalShipping = z.infer<typeof removeLocalShippingSchema>
