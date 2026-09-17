import { z } from 'zod'

export const sendChatMessageSchema = z.object({
  chatSessionId: z.coerce.number().int().positive().optional(),
  message: z.string({ required_error: 'Pesan wajib diisi' }).min(1).max(2000)
})

export const findChatSessionParamsSchema = z.object({
  chatSessionId: z.coerce.number().int().positive()
})

export type ISendChatMessage = z.infer<typeof sendChatMessageSchema>
export type IFindChatSessionParams = z.infer<typeof findChatSessionParamsSchema>
