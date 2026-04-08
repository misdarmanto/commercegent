import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { NotificationController } from '../controllers/notifications'
import {
  createNotificationSchema,
  findAllNotificationSchema,
  findDetailNotificationParamsSchema,
  removeNotificationQuerySchema,
  updateNotificationSchema,
  updatePushTokenSchema
} from '../schemas/NotificationSchema'

const NotificationRoute = Router()

NotificationRoute.use(MiddleWares.authorization)

NotificationRoute.get(
  '/',
  MiddleWares.validate({ query: findAllNotificationSchema }),
  NotificationController.findAllNotification
)

NotificationRoute.get(
  '/detail/:notificationId',
  MiddleWares.validate({ params: findDetailNotificationParamsSchema }),
  NotificationController.findDetailNotification
)

NotificationRoute.post(
  '/',
  MiddleWares.validate({ body: createNotificationSchema }),
  NotificationController.createNotification
)

NotificationRoute.patch(
  '/',
  MiddleWares.validate({ body: updateNotificationSchema }),
  NotificationController.updateNotification
)

NotificationRoute.patch(
  '/push-token',
  MiddleWares.validate({ body: updatePushTokenSchema }),
  NotificationController.updatePushToken
)

NotificationRoute.delete(
  '/',
  MiddleWares.validate({ query: removeNotificationQuerySchema }),
  NotificationController.removeNotification
)

export default NotificationRoute
