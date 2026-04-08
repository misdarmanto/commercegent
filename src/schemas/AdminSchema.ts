import { z } from 'zod'

const AdminRoleEnum = z.enum(['user', 'admin', 'superAdmin'])

export const adminSchema = z.object({
  adminName: z.string(),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
  adminWhatsAppNumber: z.string(),
  adminPhoto: z.union([z.string().url(), z.literal('')]).optional(),
  adminRole: AdminRoleEnum
})

export const updateAdminSchema = z.object({
  adminName: z.string().optional(),
  adminEmail: z.string().email().optional(),
  adminPassword: z.string().min(6).optional(),
  adminWhatsAppNumber: z.string().optional(),
  adminPhoto: z.union([z.string().url(), z.literal('')]).optional(),
  adminRole: AdminRoleEnum.optional()
})

export const updateAdminPasswordSchema = z.object({
  adminPassword: z.string().min(6),
  adminWhatsAppNumber: z.string()
})

export const findAllAdminsSchema = z.object({
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
  adminRole: AdminRoleEnum.optional()
})

export const findDetailAdminSchema = z.object({
  adminId: z.number()
})

export type ICreateAdmin = z.infer<typeof adminSchema>

export type IUpdateAdmin = z.infer<typeof updateAdminSchema>

export type IUpdateAdminPassword = z.infer<typeof updateAdminPasswordSchema>

export type IFindAllAdmins = z.infer<typeof findAllAdminsSchema>

export type IFindDetailAdmin = z.infer<typeof findDetailAdminSchema>
