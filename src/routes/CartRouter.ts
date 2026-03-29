import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { CartController } from '../controllers/cart'
import {
  findAllCartSchema,
  createCartSchema,
  removeCartQuerySchema
} from '../schemas/cartSchema'

const CartRoute = Router()

CartRoute.use(MiddleWares.authorization)
CartRoute.use(MiddleWares.allowAppRoles('user'))

CartRoute.get(
  '/',
  MiddleWares.validate({ query: findAllCartSchema }),
  CartController.findAllCart
)

CartRoute.post(
  '/',
  MiddleWares.validate({ body: createCartSchema }),
  CartController.createCart
)

CartRoute.delete(
  '/',
  MiddleWares.validate({ query: removeCartQuerySchema }),
  CartController.removeCart
)

export default CartRoute
