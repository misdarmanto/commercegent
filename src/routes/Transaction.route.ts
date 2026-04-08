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
  TransactionController.findAllTransactions
)
TransactionRoute.get(
  '/detail/:transactionId',
  MiddleWares.validate({ params: transactionDetailParamsSchema }),
  TransactionController.findDetailTransaction
)
TransactionRoute.post(
  '/',
  MiddleWares.validate({ body: createTransactionBodySchema }),
  TransactionController.createTransaction
)
TransactionRoute.patch(
  '/',
  MiddleWares.validate({ body: updateTransactionBodySchema }),
  TransactionController.updateTransaction
)
TransactionRoute.delete(
  '/',
  MiddleWares.validate({ query: removeTransactionQuerySchema }),
  TransactionController.removeTransaction
)

export default TransactionRoute
