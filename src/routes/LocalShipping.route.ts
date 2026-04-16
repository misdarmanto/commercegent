import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import {
  findAllLocalShippingSchema,
  findDetailLocalShippingSchema,
  removeLocalShippingSchema,
  createLocalShippingSchema,
  updateLocalShippingSchema
} from '../schemas/LocalShippingSchema'
import { LocalShippingController } from '../controllers/localShipping'

const LocalShippingRoute = Router()

LocalShippingRoute.get(
  '/',
  MiddleWares.validate({ query: findAllLocalShippingSchema }),
  LocalShippingController.findAllLocalShipping
)

LocalShippingRoute.get(
  '/detail/:localShippingId',
  MiddleWares.validate({ params: findDetailLocalShippingSchema }),
  LocalShippingController.findDetailLocalShipping
)

LocalShippingRoute.post(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ body: createLocalShippingSchema }),
  LocalShippingController.createLocalShipping
)

LocalShippingRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ body: updateLocalShippingSchema }),
  LocalShippingController.updateLocalShipping
)

LocalShippingRoute.delete(
  '/:localShippingId',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ params: removeLocalShippingSchema }),
  LocalShippingController.removeLocalShipping
)

export default LocalShippingRoute
