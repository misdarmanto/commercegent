import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { ShippingController } from '../controllers/shipping'
import {
  confirmDraftOrderBodySchema,
  createShippingDraftBodySchema,
  getShippingRatesBodySchema,
  trackShipmentQuerySchema
} from '../schemas/ShippingSchema'

const ShippingRoute = Router()

ShippingRoute.use(MiddleWares.authorization)

ShippingRoute.post(
  '/rates',
  MiddleWares.validate({ body: getShippingRatesBodySchema }),
  ShippingController.getShippingRates
)
ShippingRoute.post(
  '/draft',
  MiddleWares.validate({ body: createShippingDraftBodySchema }),
  ShippingController.createShippingDraft
)
ShippingRoute.post(
  '/draft/confirm',
  MiddleWares.validate({ body: confirmDraftOrderBodySchema }),
  ShippingController.confirmDraftOrder
)
ShippingRoute.get(
  '/tracking',
  MiddleWares.validate({ query: trackShipmentQuerySchema }),
  ShippingController.trackShipment
)

export default ShippingRoute
