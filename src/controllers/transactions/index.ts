import { createTransaction } from './createTransaction'
import { findAllTransactions } from './findAllTransactions'
import { findDetailTransaction } from './findDetailTransaction'
import { removeTransaction } from './removeTransaction'
import { updateTransaction } from './updateTransaction'

export const TransactionController = {
  create: createTransaction,
  findAll: findAllTransactions,
  findOne: findDetailTransaction,
  remove: removeTransaction,
  update: updateTransaction
}
