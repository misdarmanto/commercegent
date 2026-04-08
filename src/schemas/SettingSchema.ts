import { z } from 'zod'

const settingTypeFilterEnum = z.enum(['bank', 'qris', 'general', 'wa_blas'])

export const findSettingQuerySchema = z.object({
  settingType: settingTypeFilterEnum.optional()
})

export const createSettingBodySchema = z.object({
  settingType: z.enum(['general', 'wa_blas']),
  banner: z.unknown().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  waBlasToken: z.string().optional().nullable(),
  waBlasServer: z.string().optional().nullable()
})

export const updateSettingBodySchema = z.object({
  settingId: z.coerce
    .number({ invalid_type_error: 'settingId harus berupa angka' })
    .int('settingId harus bilangan bulat')
    .positive('settingId harus lebih dari 0'),

  bankName: z.string().optional(),
  bankNumber: z.string().optional(),
  bankOwner: z.string().optional(),
  qris: z.string().optional(),
  banner: z.unknown().optional(),
  whatsappNumber: z.string().optional(),
  waBlasToken: z.string().optional(),
  waBlasServer: z.string().optional()
})

export const removeSettingParamsSchema = z.object({
  settingId: z.coerce
    .number({ invalid_type_error: 'settingId harus berupa angka' })
    .int('settingId harus bilangan bulat')
    .positive('settingId harus lebih dari 0')
})

export type IFindSetting = z.infer<typeof findSettingQuerySchema>
export type ICreateSetting = z.infer<typeof createSettingBodySchema>
export type IUpdateSetting = z.infer<typeof updateSettingBodySchema>
export type IRemoveSetting = z.infer<typeof removeSettingParamsSchema>
