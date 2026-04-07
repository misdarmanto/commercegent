import { z } from 'zod'

export const createNotificationSchema = z.object({
  notificationName: z.string().min(1, 'notificationName wajib diisi'),
  notificationMessage: z.string().min(1, 'notificationMessage wajib diisi')
})

export const updateNotificationSchema = z
  .object({
    notificationId: z.coerce.number().int().positive(),
    notificationName: z.string().optional(),
    notificationMessage: z.string().optional()
  })
  .refine(
    (d) =>
      (d.notificationName != null && d.notificationName.length > 0) ||
      (d.notificationMessage != null && d.notificationMessage.length > 0),
    {
      message: 'notificationName atau notificationMessage harus diisi',
      path: ['notificationName']
    }
  )

export const removeNotificationQuerySchema = z.object({
  notificationId: z.coerce.number().int().positive()
})

export const findAllNotificationSchema = z.object({
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

export const findDetailNotificationParamsSchema = z.object({
  notificationId: z.coerce.number().int().positive()
})

export const updatePushTokenSchema = z.object({
  userFcmId: z.string().min(1, 'userFcmId wajib diisi')
})

export type ICreateNotification = z.infer<typeof createNotificationSchema>
export type IUpdateNotification = z.infer<typeof updateNotificationSchema>
export type IRemoveNotification = z.infer<typeof removeNotificationQuerySchema>
export type IFindAllNotification = z.infer<typeof findAllNotificationSchema>
export type IFindDetailNotification = z.infer<typeof findDetailNotificationParamsSchema>
export type IUpdatePushToken = z.infer<typeof updatePushTokenSchema>
