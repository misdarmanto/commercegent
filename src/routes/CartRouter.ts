import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { CartController } from '../controllers/cart'

const CartRoute = Router()

CartRoute.use(MiddleWares.authorization)
CartRoute.use(MiddleWares.allowAppRoles('user'))

CartRoute.get('/', CartController.findAll)
CartRoute.post('/', CartController.create)
CartRoute.delete('/', CartController.remove)

export default CartRoute
