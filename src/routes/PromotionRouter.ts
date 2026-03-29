import { Router } from 'express'
import { PromotionController } from '../controllers/promotions'
import { MiddleWares } from '../middlewares'

const PromotionRoute = Router()

PromotionRoute.get('/', PromotionController.findAllPromotion)
PromotionRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  PromotionController.updatePromotion
)
PromotionRoute.delete(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  PromotionController.removePromotion
)

export default PromotionRoute
