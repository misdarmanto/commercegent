import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { handleProductExcelUpload } from '../middlewares/productExcelUpload'
import { ProductController } from '../controllers/products'
import { PromotionController } from '../controllers/promotions'
import {
  createProductSchema,
  findAllProductsAdminQuerySchema,
  findAllProductsQuerySchema,
  productDetailParamsSchema,
  removeProductQuerySchema,
  updateProductSchema,
  uploadHistoriesQuerySchema
} from '../schemas/ProductSchema'

const ProductRoute = Router()

ProductRoute.get(
  '/',
  MiddleWares.validate({ query: findAllProductsQuerySchema }),
  ProductController.findAll
)

ProductRoute.get(
  '/admin',
  MiddleWares.validate({ query: findAllProductsAdminQuerySchema }),
  ProductController.findAllProductsAdmin
)

ProductRoute.get('/highlights', PromotionController.findAllPromotion)

ProductRoute.get(
  '/detail/:productId',
  MiddleWares.validate({ params: productDetailParamsSchema }),
  ProductController.findOne
)

ProductRoute.post(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ body: createProductSchema }),
  ProductController.create
)

ProductRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ body: updateProductSchema }),
  ProductController.update
)

ProductRoute.delete(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ query: removeProductQuerySchema }),
  ProductController.remove
)

ProductRoute.post(
  '/upload-excel',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  handleProductExcelUpload,
  ProductController.upload
)

ProductRoute.get(
  '/upload-histories',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ query: uploadHistoriesQuerySchema }),
  ProductController.uploadHistories
)

export default ProductRoute
