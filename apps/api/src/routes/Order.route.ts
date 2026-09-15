import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { OrderController } from '../controllers/orders'
import {
  createOrderSchema,
  findAllOrderQuerySchema,
  orderDetailParamsSchema,
  updateOrderBodySchema
} from '../schemas/orderSchema'

const OrderRoute = Router()

OrderRoute.use(MiddleWares.authorization)

OrderRoute.get(
  '/',
  MiddleWares.validate({ query: findAllOrderQuerySchema }),
  OrderController.findAllOrder
)

OrderRoute.get(
  '/detail/:orderId',
  MiddleWares.validate({ params: orderDetailParamsSchema }),
  OrderController.findDetailOrder
)

OrderRoute.post(
  '/',
  MiddleWares.allowAppRoles('user'),
  MiddleWares.validate({ body: createOrderSchema }),
  OrderController.createOrder
)

OrderRoute.patch(
  '/',
  MiddleWares.validate({ body: updateOrderBodySchema }),
  OrderController.updateOrder
)

export default OrderRoute
