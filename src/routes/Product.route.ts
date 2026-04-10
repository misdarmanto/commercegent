import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { ProductController } from '../controllers/products'
import { PromotionController } from '../controllers/promotions'
import {
  createProductSchema,
  findAllProductsAdminQuerySchema,
  findAllProductsQuerySchema,
  productDetailParamsSchema,
  removeProductQuerySchema,
  updateProductSchema
} from '../schemas/ProductSchema'
import { findProductByBarcodeSchema } from '../schemas/ProductSchema'

const ProductRoute = Router()

ProductRoute.get(
  '/',
  MiddleWares.validate({ query: findAllProductsQuerySchema }),
  ProductController.findAllProducts
)

ProductRoute.get(
  '/admin',
  MiddleWares.validate({ query: findAllProductsAdminQuerySchema }),
  ProductController.findAllProductsAdmin
)

ProductRoute.get('/highlights', PromotionController.findAllPromotion)

ProductRoute.get(
  '/barcode/:barcode',
  MiddleWares.validate({ params: findProductByBarcodeSchema }),
  ProductController.findProductByBarcode
)

ProductRoute.get(
  '/detail/:productId',
  MiddleWares.validate({ params: productDetailParamsSchema }),
  ProductController.findDetailProduct
)

ProductRoute.post(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ body: createProductSchema }),
  ProductController.createProduct
)

ProductRoute.patch(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ body: updateProductSchema }),
  ProductController.updateProduct
)

ProductRoute.delete(
  '/',
  MiddleWares.authorization,
  MiddleWares.allowAppRoles('admin', 'superAdmin'),
  MiddleWares.validate({ query: removeProductQuerySchema }),
  ProductController.removeProduct
)

export default ProductRoute
