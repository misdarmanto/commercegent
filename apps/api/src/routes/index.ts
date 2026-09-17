import { Router } from 'express'

import { StatusCodes } from 'http-status-codes'
import swaggerUi from 'swagger-ui-express'

import RoutesRegistry from './registry'
import { swaggerSpec } from '../configs/swagger'
import { ResponseData } from '../utilities/response'
import logger from '../utilities/logger'

const routers = Router()

routers.use('/api/v1/', RoutesRegistry.HealthRoute)
routers.use('/api/v1/app-logs', RoutesRegistry.AppLogRoute)
routers.use('/api/v1/addresses', RoutesRegistry.AddressRoute)
routers.use('/api/v1/admins', RoutesRegistry.AdminRoute)
routers.use('/api/v1/regions', RoutesRegistry.RegionRoute)
routers.use('/api/v1/users', RoutesRegistry.UserRoute)
routers.use('/api/v1/carts', RoutesRegistry.CartRoute)
routers.use('/api/v1/chats', RoutesRegistry.ChatRoute)
routers.use('/api/v1/categories', RoutesRegistry.CategoryRoute)
routers.use('/api/v1/my-profiles', RoutesRegistry.MyProfileRoute)
routers.use('/api/v1/notifications', RoutesRegistry.NotificationRoute)
routers.use('/api/v1/orders', RoutesRegistry.OrderRoute)
routers.use('/api/v1/products', RoutesRegistry.ProductRoute)
routers.use('/api/v1/settings', RoutesRegistry.SettingRoute)
routers.use('/api/v1/statistic', RoutesRegistry.StatisticRoute)
routers.use('/api/v1/transactions', RoutesRegistry.TransactionRoute)
routers.use('/api/v1/shipping', RoutesRegistry.ShippingRoute)
routers.use('/api/v1/webhooks', RoutesRegistry.WebhookRouter)
routers.use('/api/v1/promotions', RoutesRegistry.PromotionRoute)
routers.use('/api/v1/public', RoutesRegistry.PublicRouter)
routers.use('/api/v1/otp', RoutesRegistry.OtpRoute)
routers.use('/api/v1/auth', RoutesRegistry.AuthRoute)
routers.use('/api/v1/upload-products', RoutesRegistry.UploadProductRoute)
routers.use('/api/v1/banners', RoutesRegistry.BannerRoute)
routers.use('/api/v1/local-shippings', RoutesRegistry.LocalShippingRoute)
routers.use('/api/v1/faqs', RoutesRegistry.FaqRoute)
routers.use('/api/v1/uploads', RoutesRegistry.FileRoute)

routers.use(
  '/api/v1/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customJs: '/api/v1/docs-static/swagger-qr-preview.js'
  })
)

routers.use((req, res) => {
  const message = `Route ${req.originalUrl} not found!`
  logger.warn(message)
  const response = ResponseData.error({ message })
  return res.status(StatusCodes.NOT_FOUND).json(response)
})

export default routers
