import { Router } from 'express'
import { PromotionController } from '../controllers/promotions'
import { MiddleWares } from '../middlewares'
import {
  findAllPromotionQuerySchema,
  removePromotionQuerySchema,
  updatePromotionSchema
} from '../schemas/promotionSchema'

const PromotionRoute = Router()

PromotionRoute.get(
  '/',
  MiddleWares.validate({ query: findAllPromotionQuerySchema }),
  PromotionController.findAllPromotion
)

PromotionRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ body: updatePromotionSchema }),
  PromotionController.updatePromotion
)

PromotionRoute.delete(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ query: removePromotionQuerySchema }),
  PromotionController.removePromotion
)

export default PromotionRoute
