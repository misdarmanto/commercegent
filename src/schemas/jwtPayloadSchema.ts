import { z } from 'zod'

export const jwtPayloadSchema = z.object({
  userId: z.number().optional(),
  userRole: z.string().optional(),
  iat: z.unknown().optional()
})
