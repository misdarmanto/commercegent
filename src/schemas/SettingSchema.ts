import { z } from 'zod'

export const findSettingQuerySchema = z.object({
  settingId: z.coerce
    .number({ invalid_type_error: 'settingId harus berupa angka' })
    .int('settingId harus bilangan bulat')
    .positive('settingId harus lebih dari 0')
})

export const createSettingBodySchema = z.object({
  whatsappNumber: z.string().optional().nullable()
})

export const updateSettingBodySchema = z.object({
  settingId: z.coerce
    .number({ invalid_type_error: 'settingId harus berupa angka' })
    .int('settingId harus bilangan bulat')
    .positive('settingId harus lebih dari 0'),

  whatsappNumber: z.string().optional()
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
