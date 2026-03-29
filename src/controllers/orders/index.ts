import { createOrder } from './create'
import { findAllOrder, findDetailOrder } from './find'
import { updateOrder } from './update'

export const OrderController = {
  create: createOrder,
  findAll: findAllOrder,
  findOne: findDetailOrder,
  update: updateOrder
}
