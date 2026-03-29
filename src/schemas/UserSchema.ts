import { z } from 'zod'
import { jwtPayloadSchema } from './jwtPayloadSchema'

const userRoleEnum = z.enum(['user', 'admin', 'superAdmin'])
const userGenderEnum = z.enum(['pria', 'wanita'])

export const userSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  userName: z.string(),
  userEmail: z.string().email(),
  userPassword: z.string().min(6),
  userWhatsAppNumber: z.string(),
  userPhoto: z.union([z.string().url(), z.literal('')]).optional(),
  userRole: userRoleEnum,
  userGender: userGenderEnum,
  userCoin: z.number().min(0).optional().default(0),
  userFcmId: z.string().optional(),
  userPartnerCode: z.string()
})

export const userUpdateSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
  userPassword: z.string().min(6).optional(),
  userWhatsAppNumber: z.string().optional(),
  userPhoto: z.union([z.string().url(), z.literal('')]).optional(),
  userRole: userRoleEnum.optional(),
  userGender: userGenderEnum.optional(),
  userCoin: z.number().min(0).optional(),
  userFcmId: z.string().optional(),
  userPartnerCode: z.string().optional()
})

export const userUpdatePasswordSchema = z.object({
  userPassword: z.string().min(6),
  userWhatsAppNumber: z.string()
})

export const requestOtpSchema = z.object({
  whatsappNumber: z
    .string()
    .regex(/^[0-9]+$/, 'Nomor WhatsApp hanya angka')
    .min(10)
    .max(15),
  otpType: z.enum(['register', 'resetPassword'])
})

export const verifyOtpSchema = z.object({
  whatsappNumber: z
    .string()
    .regex(/^[0-9]+$/, 'Nomor WhatsApp hanya angka')
    .min(10)
    .max(15),
  otpCode: z.string().max(100)
})

export const findAllUsersSchema = z.object({
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
  userRole: userRoleEnum.optional(),
  jwtPayload: jwtPayloadSchema
})

export type ICreateUser = z.infer<typeof userSchema>

export type IUpdateUser = z.infer<typeof userUpdateSchema>

export type IUpdateUserPassword = z.infer<typeof userUpdatePasswordSchema>

export type IRequestOtp = z.infer<typeof requestOtpSchema>

export type IVerifyOtp = z.infer<typeof verifyOtpSchema>

export type IFindAllUsers = z.infer<typeof findAllUsersSchema>
