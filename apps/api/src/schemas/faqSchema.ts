import { z } from 'zod'

export const findAllFaqsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  search: z
    .union([z.string(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true')
})

export const createFaqSchema = z.object({
  faqQuestion: z
    .string({ required_error: 'Pertanyaan wajib diisi' })
    .min(3, 'Pertanyaan minimal 3 karakter')
    .max(500, 'Pertanyaan maksimal 500 karakter'),
  faqAnswer: z
    .string({ required_error: 'Jawaban wajib diisi' })
    .min(3, 'Jawaban minimal 3 karakter')
})

export const updateFaqSchema = z.object({
  faqId: z.coerce
    .number({ invalid_type_error: 'faqId harus berupa angka' })
    .int('faqId harus bilangan bulat')
    .positive('faqId harus lebih dari 0'),
  faqQuestion: z.string().min(3).max(500).optional(),
  faqAnswer: z.string().min(3).optional()
})

export const removeFaqSchema = z.object({
  faqId: z.coerce
    .number({ invalid_type_error: 'faqId harus berupa angka' })
    .int('faqId harus bilangan bulat')
    .positive('faqId harus lebih dari 0')
})

export const faqDetailParamsSchema = z.object({
  faqId: z.coerce.number().int().positive()
})

export type IFindAllFaqs = z.infer<typeof findAllFaqsSchema>
export type ICreateFaq = z.infer<typeof createFaqSchema>
export type IUpdateFaq = z.infer<typeof updateFaqSchema>
export type IRemoveFaq = z.infer<typeof removeFaqSchema>
export type IFaqDetailParams = z.infer<typeof faqDetailParamsSchema>
