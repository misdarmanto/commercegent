import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { CartController } from '../controllers/cart'
import {
  findAllCartSchema,
  createCartSchema,
  removeCartQuerySchema,
  updateCartSchema
} from '../schemas/CartSchema'

const CartRoute = Router()

CartRoute.use(MiddleWares.authorization)
CartRoute.use(MiddleWares.allowAppRoles('user'))

CartRoute.get(
  '/',
  MiddleWares.validate({ query: findAllCartSchema }),
  CartController.findAllCart
)

CartRoute.get('/total', CartController.findTotalCart)

CartRoute.post(
  '/',
  MiddleWares.validate({ body: createCartSchema }),
  CartController.createCart
)

CartRoute.patch(
  '/',
  MiddleWares.validate({ body: updateCartSchema }),
  CartController.updateCart
)

CartRoute.delete(
  '/',
  MiddleWares.validate({ query: removeCartQuerySchema }),
  CartController.removeCart
)

export default CartRoute
