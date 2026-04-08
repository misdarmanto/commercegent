import { z } from 'zod'

export const findTotalStatisticSchema = z.object({})

export type IFindTotalStatistic = z.infer<typeof findTotalStatisticSchema>
