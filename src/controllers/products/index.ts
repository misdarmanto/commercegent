import { findAllProductsAdmin } from './findAllProductsAdmin'
import { createProduct } from './createProduct'
import { findAllProducts } from './findAllProducts'
import { findDetailProduct } from './findDetailProduct'
import { removeProduct } from './removeProduct'
import { updateProduct } from './updateProduct'
import { uploadProductExcel } from './uploadProductExcel'
import { uploadHistories } from './uploadHistories'

export const ProductController = {
  create: createProduct,
  findAll: findAllProducts,
  findOne: findDetailProduct,
  remove: removeProduct,
  update: updateProduct,
  upload: uploadProductExcel,
  uploadHistories,
  findAllProductsAdmin
}
