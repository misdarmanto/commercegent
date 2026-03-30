import { z } from 'zod'

/* ============================= */
/* FIND TOTAL (query) */
/* ============================= */

export const findTotalStatisticQuerySchema = z.object({})

export type IFindTotalStatisticQuery = z.infer<typeof findTotalStatisticQuerySchema>
