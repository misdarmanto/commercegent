import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { OrderController } from '../controllers/orders'
import {
  createOrderSchema,
  findAllOrderQuerySchema,
  orderDetailParamsSchema,
  updateOrderBodySchema
} from '../schemas/OrderSchema'

const OrderRoute = Router()

OrderRoute.use(MiddleWares.authorization)

OrderRoute.get(
  '/',
  MiddleWares.validate({ query: findAllOrderQuerySchema }),
  OrderController.findAll
)

OrderRoute.get(
  '/detail/:orderId',
  MiddleWares.validate({ params: orderDetailParamsSchema }),
  OrderController.findOne
)

OrderRoute.post(
  '/',
  MiddleWares.allowAppRoles('user'),
  MiddleWares.validate({ body: createOrderSchema }),
  OrderController.create
)

OrderRoute.patch(
  '/',
  MiddleWares.validate({ body: updateOrderBodySchema }),
  OrderController.update
)

export default OrderRoute
