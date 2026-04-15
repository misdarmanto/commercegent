import { z } from 'zod'

export const findAllBannersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true')
})

export const createBannerSchema = z.object({
  bannerImage: z.string().optional().nullable(),
  bannerOrder: z.number().optional().nullable()
})

export const updateBannerSchema = z.object({
  settingId: z.coerce
    .number({ invalid_type_error: 'bannerId harus berupa angka' })
    .int('bannerId harus bilangan bulat')
    .positive('bannerId harus lebih dari 0'),

  bannerImage: z.string().optional(),
  bannerOrder: z.number().optional()
})

export const removeBannerSchema = z.object({
  bannerId: z.coerce
    .number({ invalid_type_error: 'bannerId harus berupa angka' })
    .int('bannerId harus bilangan bulat')
    .positive('bannerId harus lebih dari 0')
})

export type IFindAllBanners = z.infer<typeof findAllBannersSchema>
export type ICreateBanner = z.infer<typeof createBannerSchema>
export type IUpdateBanner = z.infer<typeof updateBannerSchema>
export type IRemoveBanner = z.infer<typeof removeBannerSchema>
