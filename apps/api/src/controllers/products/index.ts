import { findAllProductsAdmin } from './findAllProductsAdmin'
import { createProduct } from './createProduct'
import { findAllProducts } from './findAllProducts'
import { findDetailProduct } from './findDetailProduct'
import { findProductByBarcode } from './findProductByBarcode'
import { removeProduct } from './removeProduct'
import { updateProduct } from './updateProduct'

export const ProductController = {
  createProduct,
  findAllProducts,
  findDetailProduct,
  removeProduct,
  updateProduct,
  findAllProductsAdmin,
  findProductByBarcode
}
