import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { TransactionController } from '../controllers/transactions'
import {
  createTransactionBodySchema,
  findAllTransactionQuerySchema,
  removeTransactionQuerySchema,
  transactionDetailParamsSchema,
  updateTransactionBodySchema
} from '../schemas/TransactionSchema'

const TransactionRoute = Router()

TransactionRoute.use(MiddleWares.authorization)
TransactionRoute.get(
  '/',
  MiddleWares.validate({ query: findAllTransactionQuerySchema }),
  TransactionController.findAll
)
TransactionRoute.get(
  '/detail/:transactionId',
  MiddleWares.validate({ params: transactionDetailParamsSchema }),
  TransactionController.findOne
)
TransactionRoute.post(
  '/',
  MiddleWares.validate({ body: createTransactionBodySchema }),
  TransactionController.create
)
TransactionRoute.patch(
  '/',
  MiddleWares.validate({ body: updateTransactionBodySchema }),
  TransactionController.update
)
TransactionRoute.delete(
  '/',
  MiddleWares.validate({ query: removeTransactionQuerySchema }),
  TransactionController.remove
)

export default TransactionRoute
