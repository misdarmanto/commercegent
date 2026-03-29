import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { ShippingController } from '../controllers/shipping'

const ShippingRoute = Router()

ShippingRoute.use(MiddleWares.authorization)
ShippingRoute.post('/rates', ShippingController.getShippingRates)
ShippingRoute.post('/draft', ShippingController.createShippingDraft)
ShippingRoute.post('/draft/confirm', ShippingController.confirmDraftOrder)
ShippingRoute.get('/tracking', ShippingController.trackShipment)

export default ShippingRoute
