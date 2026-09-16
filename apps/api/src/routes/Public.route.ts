import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { PublicApiController } from '../controllers/publicApi'
import {
  createProductPublicSchema,
  findAllOrderPublicQuerySchema,
  updateProductPublicSchema
} from '../schemas/publicApiSchema'

const PublicRouter = Router()

PublicRouter.get(
  '/orders',
  MiddleWares.validate({ query: findAllOrderPublicQuerySchema }),
  PublicApiController.findAllOrderPublic
)

PublicRouter.post(
  '/products',
  MiddleWares.validate({ body: createProductPublicSchema }),
  PublicApiController.createProductPublic
)

PublicRouter.patch(
  '/products',
  MiddleWares.validate({ body: updateProductPublicSchema }),
  PublicApiController.updateProductPublic
)

export default PublicRouter
