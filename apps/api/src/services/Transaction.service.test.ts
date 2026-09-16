import { StatusCodes } from 'http-status-codes'
import { TransactionService } from './Transaction.service'
import { TransactionsModel } from '../models/TransactionModel'
import { UserModel } from '../models/UserModel'

jest.mock('../models/TransactionModel', () => ({
  TransactionsModel: { findAndCountAll: jest.fn(), findOne: jest.fn(), create: jest.fn() }
}))
jest.mock('../models/UserModel', () => ({ UserModel: { findOne: jest.fn() } }))
jest.mock('../models/OrderModel', () => ({ OrdersModel: {} }))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAndCountAll = TransactionsModel.findAndCountAll as jest.Mock
const mockedFindOne = TransactionsModel.findOne as jest.Mock
const mockedCreate = TransactionsModel.create as jest.Mock
const mockedUserFindOne = UserModel.findOne as jest.Mock

describe('TransactionService.findAllTransactions', () => {
  it('throws a 404 AppError when the user does not exist', async () => {
    mockedUserFindOne.mockResolvedValue(null)

    await expect(
      TransactionService.findAllTransactions(1, { page: 1, size: 10 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('scopes results to the current user when the role is "user"', async () => {
    mockedUserFindOne.mockResolvedValue({ userRole: 'user' })
    mockedFindAndCountAll.mockResolvedValue({ count: 0, rows: [] })

    await TransactionService.findAllTransactions(1, { page: 1, size: 10 } as any)

    const where = mockedFindAndCountAll.mock.calls[0][0].where
    expect(where.transactionUserId).toBeDefined()
  })

  it('does not scope by user for an admin role', async () => {
    mockedUserFindOne.mockResolvedValue({ userRole: 'admin' })
    mockedFindAndCountAll.mockResolvedValue({ count: 0, rows: [] })

    await TransactionService.findAllTransactions(1, { page: 1, size: 10 } as any)

    const where = mockedFindAndCountAll.mock.calls[0][0].where
    expect(where.transactionUserId).toBeUndefined()
  })
})

describe('TransactionService.findDetailTransaction', () => {
  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(
      TransactionService.findDetailTransaction({ transactionId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})

describe('TransactionService.createTransaction', () => {
  it('stringifies the userId on the created record', async () => {
    await TransactionService.createTransaction(1, { transactionAmount: 1000 } as any)

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ transactionUserId: '1', deleted: false })
    )
  })
})

describe('TransactionService.updateTransaction', () => {
  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(
      TransactionService.updateTransaction({ transactionId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('only applies the provided fields', async () => {
    const existing = { update: jest.fn() }
    mockedFindOne.mockResolvedValue(existing)

    await TransactionService.updateTransaction({
      transactionId: 1,
      transactionStatus: 'paid'
    } as any)

    expect(existing.update).toHaveBeenCalledWith({ transactionStatus: 'paid' })
  })
})

describe('TransactionService.removeTransaction', () => {
  it('soft-deletes the transaction', async () => {
    const row = { deleted: false, save: jest.fn() }
    mockedFindOne.mockResolvedValue(row)

    await TransactionService.removeTransaction({ transactionId: 1 } as any)

    expect(row.deleted).toBe(true)
    expect(row.save).toHaveBeenCalled()
  })

  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(
      TransactionService.removeTransaction({ transactionId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})
