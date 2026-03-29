import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { OrderController } from '../controllers/orders'

const OrderRoute = Router()

OrderRoute.use(MiddleWares.authorization)
OrderRoute.get('/', OrderController.findAll)
OrderRoute.get('/detail/:orderId', OrderController.findOne)

OrderRoute.post('/', MiddleWares.allowAppRoles('user'), OrderController.create)
OrderRoute.patch('/', OrderController.update)

export default OrderRoute
