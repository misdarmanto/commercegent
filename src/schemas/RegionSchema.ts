import { z } from 'zod'

export const regenciesParamsSchema = z.object({
  provinceId: z.string().min(1)
})

export const districtsParamsSchema = z.object({
  regencyId: z.string().min(1)
})

export const villagesParamsSchema = z.object({
  districtId: z.string().min(1)
})

export type IFindRegencies = z.infer<typeof regenciesParamsSchema>
export type IFindDistricts = z.infer<typeof districtsParamsSchema>
export type IFindVillages = z.infer<typeof villagesParamsSchema>
