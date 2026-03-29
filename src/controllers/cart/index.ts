import { createCart } from './create'
import { findAllCart } from './find'
import { removeCart } from './remove'

export const CartController = {
  create: createCart,
  findAll: findAllCart,
  remove: removeCart
}
