import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { TransactionsAttributes, TransactionsModel } from '../models/TransactionModel'
import { UserAttributes, UserModel } from '../models/UserModel'
import { OrdersModel } from '../models/OrderModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  IFindAllTransaction,
  ICreateTransaction,
  IUpdateTransaction,
  IRemoveTransaction,
  IFindDetailTransaction
} from '../schemas/TransactionSchema'

export class TransactionService {
  private static buildFindAllWhere(
    userId: number,
    userRole: string
  ): WhereOptions<TransactionsAttributes> {
    const where: WhereOptions<TransactionsAttributes> = {
      deleted: { [Op.eq]: false }
    }

    if (userRole === 'user') {
      where.transactionUserId = { [Op.eq]: String(userId) }
    }

    return where
  }

  static async findAllTransactions(userId: number, payload: IFindAllTransaction) {
    try {
      const user = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          userId
        }
      })

      if (user == null) {
        throw new AppError('User not found!', StatusCodes.NOT_FOUND)
      }

      const pager = new Pagination(payload.page, payload.size)

      const result = await TransactionsModel.findAndCountAll({
        where: this.buildFindAllWhere(userId, user.userRole),
        include: [
          {
            model: UserModel,
            attributes: ['userId', 'userName']
          },
          { model: OrdersModel }
        ],
        order: [['transactionId', 'desc']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[TransactionService] findAllTransactions failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to get all transactions',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findDetailTransaction(payload: IFindDetailTransaction) {
    try {
      const result = await TransactionsModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          transactionId: { [Op.eq]: payload.transactionId }
        },
        include: [
          {
            model: UserModel,
            attributes: ['userId', 'userName', 'userPhoto']
          },
          { model: OrdersModel }
        ]
      })

      if (result == null) {
        throw new AppError('Transaction not found!', StatusCodes.NOT_FOUND)
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[TransactionService] findDetailTransaction failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to get detail transaction',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async createTransaction(userId: number, payload: ICreateTransaction) {
    try {
      const createPayload = {
        ...payload,
        transactionUserId: String(userId),
        deleted: false
      } as TransactionsAttributes

      await TransactionsModel.create(createPayload as TransactionsAttributes)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[TransactionService] createTransaction failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to create transaction',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async updateTransaction(payload: IUpdateTransaction) {
    try {
      const existing = await TransactionsModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          transactionId: { [Op.eq]: payload.transactionId }
        }
      })

      if (existing == null) {
        throw new AppError('Transaction not found!', StatusCodes.NOT_FOUND)
      }

      const updatePayload: Record<string, unknown> = {}

      if (payload.transactionStatus != null) {
        updatePayload.transactionStatus = payload.transactionStatus
      }
      if (payload.transactionPaymentType != null) {
        updatePayload.transactionPaymentType = payload.transactionPaymentType
      }
      if (payload.transactionRawResponse != null) {
        updatePayload.transactionRawResponse = payload.transactionRawResponse
      }

      await existing.update(updatePayload)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[TransactionService] updateTransaction failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to update transaction',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async removeTransaction(payload: IRemoveTransaction) {
    try {
      const row = await TransactionsModel.findOne({
        where: {
          deleted: { [Op.eq]: false },
          transactionId: { [Op.eq]: payload.transactionId }
        }
      })

      if (row == null) {
        throw new AppError('Transaction not found!', StatusCodes.NOT_FOUND)
      }

      row.deleted = true
      await row.save()
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[TransactionService] removeTransaction failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to remove transaction',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
