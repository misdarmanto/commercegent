import { z } from 'zod'

export const findTotalStatisticSchema = z.object({})
export const findTotalVisitorSchema = z.object({
  range: z.enum(['1d', '7d', '1m', '3m', '1y']).default('1d'),
  interval: z.enum(['1h', '12h', '1d']).default('1h')
})
export const createVisitorSchema = z.object({
  visitorMeta: z
    .string({ invalid_type_error: 'visitorMeta harus berupa string' })
    .optional()
    .default('')
})

export type IFindTotalStatistic = z.infer<typeof findTotalStatisticSchema>
export type IFindTotalVisitor = z.infer<typeof findTotalVisitorSchema>
export type ICreateVisitor = z.infer<typeof createVisitorSchema>
