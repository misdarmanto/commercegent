import { Router } from 'express'
import { PublicApiController } from '../controllers/publicApi'

const PublicRouter = Router()

PublicRouter.get('/orders', PublicApiController.findAllOrderPublic)
PublicRouter.post('/products', PublicApiController.createProductPublic)
PublicRouter.patch('/products', PublicApiController.updateProductPublic)

export default PublicRouter
