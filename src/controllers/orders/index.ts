import { createOrder } from './createOrder'
import { findAllOrder } from './findAllOrder'
import { findDetailOrder } from './findDetailOrder'
import { updateOrder } from './updateOrder'

export const OrderController = {
  create: createOrder,
  findAll: findAllOrder,
  findOne: findDetailOrder,
  update: updateOrder
}
