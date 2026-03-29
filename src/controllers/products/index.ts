import { findAllProductsAdmin } from './adminProduct'
import { createProduct } from './create'
import { findAllProducts, findDetailProduct } from './find'
import { removeProduct } from './remove'
import { updateProduct } from './update'
import { uploadProductExcel } from './upload'
import { uploadHistories } from './uploadHistory'

export const ProductController = {
  create: createProduct,
  findAll: findAllProducts,
  findOne: findDetailProduct,
  remove: removeProduct,
  update: updateProduct,
  upload: uploadProductExcel,
  uploadHistories: uploadHistories,
  findAllProductsAdmin
}
