import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { NotificationController } from '../controllers/notifications'

const NotificationRoute = Router()

NotificationRoute.use(MiddleWares.authorization)
NotificationRoute.get('/', NotificationController.findAll)
NotificationRoute.get('/detail/:notificationId', NotificationController.findOne)
NotificationRoute.post('/', NotificationController.create)
NotificationRoute.patch('/', NotificationController.update)
NotificationRoute.patch('/push-token', NotificationController.updatePushToken)
NotificationRoute.delete('/', NotificationController.remove)

export default NotificationRoute
