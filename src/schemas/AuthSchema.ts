import { z } from 'zod'

export const loginAdminSchema = z.object({
  adminWhatsAppNumber: z.string(),
  adminPassword: z.string()
})

export const loginUserSchema = z.object({
  userWhatsAppNumber: z.string(),
  userPassword: z.string()
})

export const signupAdminSchema = z.object({
  adminName: z.string(),
  adminPassword: z.string().min(6),
  adminWhatsAppNumber: z.string()
})

export const signupUserSchema = z.object({
  userName: z.string(),
  userPassword: z.string().min(6),
  userWhatsAppNumber: z.string()
})

export type ILoginAdmin = z.infer<typeof loginAdminSchema>
export type ILoginUser = z.infer<typeof loginUserSchema>
export type ISignupAdmin = z.infer<typeof signupAdminSchema>
export type ISignupUser = z.infer<typeof signupUserSchema>
