import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { TransactionController } from '../controllers/transactions'

const TransactionRoute = Router()

TransactionRoute.use(MiddleWares.authorization)
TransactionRoute.get('/', TransactionController.findAll)
TransactionRoute.get('/detail/:transactionId', TransactionController.findOne)
TransactionRoute.post('/', TransactionController.create)
TransactionRoute.patch('/', TransactionController.update)
TransactionRoute.delete('/', TransactionController.remove)

export default TransactionRoute
