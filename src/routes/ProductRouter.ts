import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { ProductController } from '../controllers/products'
import { PromotionController } from '../controllers/promotions'

const ProductRoute = Router()

ProductRoute.get('/', ProductController.findAll)
ProductRoute.get('/admin', ProductController.findAllProductsAdmin)
ProductRoute.get('/highlights', PromotionController.findAllPromotion)

ProductRoute.get('/detail/:productId', ProductController.findOne)

ProductRoute.post(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  ProductController.create
)

ProductRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  ProductController.update
)

ProductRoute.delete(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  ProductController.remove
)

ProductRoute.post(
  '/upload-excel',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  ProductController.upload
)

ProductRoute.get(
  '/upload-histories',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  ProductController.uploadHistories
)

export default ProductRoute
