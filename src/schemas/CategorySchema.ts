import { z } from 'zod'

const categoryTypeEnum = z.enum(['parent', 'child'])

/* ============================= */
/* CREATE CATEGORY (body) */
/* ============================= */

export const createCategorySchema = z.object({
  categoryName: z.string().min(1, 'categoryName wajib diisi'),
  categoryReference: z.string().optional(),
  categoryIcon: z.string().optional(),
  categoryType: categoryTypeEnum.optional()
})

/* ============================= */
/* UPDATE CATEGORY (body) */
/* ============================= */

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

/* ============================= */
/* REMOVE CATEGORY (query) */
/* ============================= */

export const removeCategoryQuerySchema = z.object({
  categoryId: z.coerce
    .number({ invalid_type_error: 'categoryId harus berupa angka' })
    .int()
    .positive()
})

/* ============================= */
/* FIND ALL (query) */
/* ============================= */

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

/* ============================= */
/* FIND DETAIL (params) */
/* ============================= */

export const findDetailCategoryParamsSchema = z.object({
  categoryId: z.coerce
    .number({ invalid_type_error: 'categoryId harus berupa angka' })
    .int()
    .positive()
})

export type ICreateCategoryBody = z.infer<typeof createCategorySchema>
export type IUpdateCategoryBody = z.infer<typeof updateCategorySchema>
export type IRemoveCategoryQuery = z.infer<typeof removeCategoryQuerySchema>
export type IFindAllCategoryQuery = z.infer<typeof findAllCategorySchema>
export type IFindDetailCategoryParams = z.infer<typeof findDetailCategoryParamsSchema>
