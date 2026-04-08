import { createTransaction } from './createTransaction'
import { findAllTransactions } from './findAllTransactions'
import { findDetailTransaction } from './findDetailTransaction'
import { removeTransaction } from './removeTransaction'
import { updateTransaction } from './updateTransaction'

export const TransactionController = {
  createTransaction,
  findAllTransactions,
  findDetailTransaction,
  removeTransaction,
  updateTransaction
}
