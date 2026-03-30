import { z } from 'zod'

const transactionStatusEnum = z.enum(['pending', 'success', 'failed', 'expire', 'cancel'])

/* ============================= */
/* FIND ALL TRANSACTIONS (query) */
/* ============================= */

export const findAllTransactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(10),
  search: z
    .union([z.string(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true')
})

/* ============================= */
/* TRANSACTION DETAIL (params) */
/* ============================= */

export const transactionDetailParamsSchema = z.object({
  transactionId: z.coerce
    .number({ invalid_type_error: 'transactionId harus berupa angka' })
    .int('transactionId harus bilangan bulat')
    .positive('transactionId harus lebih dari 0')
})

/* ============================= */
/* CREATE TRANSACTION (body) */
/* ============================= */

export const createTransactionBodySchema = z.object({
  transactionOrderId: z.coerce
    .number({ invalid_type_error: 'transactionOrderId harus berupa angka' })
    .int('transactionOrderId harus bilangan bulat')
    .positive('transactionOrderId harus lebih dari 0'),

  transactionAmount: z.coerce
    .number({ invalid_type_error: 'transactionAmount harus berupa angka' })
    .int('transactionAmount harus bilangan bulat')
    .min(0),

  transactionOngkirPrice: z.coerce
    .number({ invalid_type_error: 'transactionOngkirPrice harus berupa angka' })
    .int('transactionOngkirPrice harus bilangan bulat')
    .min(0),

  transactionProvider: z.literal('midtrans').optional(),
  transactionPaymentType: z.string().optional(),
  transactionSnapToken: z.string().optional(),
  transactionStatus: transactionStatusEnum.optional(),
  transactionRawResponse: z.unknown().optional()
})

/* ============================= */
/* UPDATE TRANSACTION (body) */
/* ============================= */

export const updateTransactionBodySchema = z.object({
  transactionId: z.coerce
    .number({ invalid_type_error: 'transactionId harus berupa angka' })
    .int('transactionId harus bilangan bulat')
    .positive('transactionId harus lebih dari 0'),

  transactionStatus: transactionStatusEnum.optional(),
  transactionPaymentType: z.string().optional(),
  transactionRawResponse: z.unknown().optional()
})

/* ============================= */
/* REMOVE TRANSACTION (query) */
/* ============================= */

export const removeTransactionQuerySchema = z.object({
  transactionId: z.coerce
    .number({ invalid_type_error: 'transactionId harus berupa angka' })
    .int('transactionId harus bilangan bulat')
    .positive('transactionId harus lebih dari 0')
})

export type IFindAllTransactionQuery = z.infer<typeof findAllTransactionQuerySchema>
export type ITransactionDetailParams = z.infer<typeof transactionDetailParamsSchema>
export type ICreateTransactionBody = z.infer<typeof createTransactionBodySchema>
export type IUpdateTransactionBody = z.infer<typeof updateTransactionBodySchema>
export type IRemoveTransactionQuery = z.infer<typeof removeTransactionQuerySchema>
