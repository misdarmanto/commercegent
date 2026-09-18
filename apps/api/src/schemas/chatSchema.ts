import { z } from 'zod'

export const chatLanguageSchema = z.enum(['en', 'id'])

export const sendChatMessageSchema = z.object({
  chatSessionId: z.coerce.number().int().positive().optional(),
  message: z.string({ required_error: 'Pesan wajib diisi' }).min(1).max(2000),
  language: chatLanguageSchema.optional().default('id')
})

export const findChatSessionParamsSchema = z.object({
  chatSessionId: z.coerce.number().int().positive()
})

export type IChatLanguage = z.infer<typeof chatLanguageSchema>
export type ISendChatMessage = z.infer<typeof sendChatMessageSchema>
export type IFindChatSessionParams = z.infer<typeof findChatSessionParamsSchema>
