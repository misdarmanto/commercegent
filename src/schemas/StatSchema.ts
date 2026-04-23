import { z } from 'zod'

export const findStatQuerySchema = z.object({})

export const createStatSchema = z.object({
  statTotalVisit: z.coerce
    .number({ invalid_type_error: 'statTotalVisit harus berupa angka' })
    .int('statTotalVisit harus bilangan bulat')
    .min(0, 'statTotalVisit tidak boleh kurang dari 0')
    .default(0)
})

export const updateStatSchema = z.object({
  statId: z.coerce
    .number({ invalid_type_error: 'statId harus berupa angka' })
    .int('statId harus bilangan bulat')
    .positive('statId harus lebih dari 0'),
  statTotalVisit: z.coerce
    .number({ invalid_type_error: 'statTotalVisit harus berupa angka' })
    .int('statTotalVisit harus bilangan bulat')
    .min(0, 'statTotalVisit tidak boleh kurang dari 0')
})

export type IFindStat = z.infer<typeof findStatQuerySchema>
export type ICreateStat = z.infer<typeof createStatSchema>
export type IUpdateStat = z.infer<typeof updateStatSchema>
