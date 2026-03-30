import { z } from 'zod'

const userRoleEnum = z.enum(['user', 'courier', 'office', 'admin', 'superAdmin'])

/* ============================= */
/* UPDATE MY PROFILE (body) */
/* ============================= */

export const updateMyProfileSchema = z
  .object({
    userName: z.string().min(1).optional(),
    userPassword: z.string().min(6).optional(),
    userRole: userRoleEnum.optional()
  })
  .refine((d) => d.userName != null || d.userPassword != null || d.userRole != null, {
    message: 'Minimal satu field harus diisi',
    path: ['userName']
  })

export type IUpdateMyProfileBody = z.infer<typeof updateMyProfileSchema>
