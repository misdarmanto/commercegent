import { z } from 'zod'

const categoryTypeEnum = z.enum(['parent', 'child'])

export const createCategorySchema = z.object({
  categoryName: z.string().min(1, 'categoryName wajib diisi'),
  categoryReference: z.string().optional(),
  categoryIcon: z.string().optional(),
  categoryType: categoryTypeEnum.optional()
})

export const updateCategorySchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
    categoryName: z.string().optional(),
    categoryIcon: z.string().optional()
  })
  .refine(
    (d) =>
      (d.categoryName != null && d.categoryName.length > 0) ||
      (d.categoryIcon != null && String(d.categoryIcon).length > 0),
    { message: 'categoryName atau categoryIcon harus diisi', path: ['categoryName'] }
  )

export const removeCategoryQuerySchema = z.object({
  categoryId: z.coerce
    .number({ invalid_type_error: 'categoryId harus berupa angka' })
    .int()
    .positive()
})

export const findAllCategorySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  search: z
    .union([z.string(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  categoryReference: z
    .union([z.string(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  categoryType: categoryTypeEnum.optional()
})

export const findDetailCategoryParamsSchema = z.object({
  categoryId: z.coerce
    .number({ invalid_type_error: 'categoryId harus berupa angka' })
    .int()
    .positive()
})

export type ICreateCategory = z.infer<typeof createCategorySchema>
export type IUpdateCategory = z.infer<typeof updateCategorySchema>
export type IRemoveCategory = z.infer<typeof removeCategoryQuerySchema>
export type IFindAllCategories = z.infer<typeof findAllCategorySchema>
export type IFindDetailCategory = z.infer<typeof findDetailCategoryParamsSchema>
