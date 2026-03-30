import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { TransactionsModel } from '../models/transactions'
import { UserModel } from '../models/user'
import { OrdersModel } from '../models/orders'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type {
  ICreateTransactionBody,
  IFindAllTransactionQuery,
  IRemoveTransactionQuery,
  ITransactionDetailParams,
  IUpdateTransactionBody
} from '../schemas/TransactionSchema'

export class TransactionService {
  static async findAllTransactions(userId: number, query: IFindAllTransactionQuery) {
    try {
      const user = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userId
        }
      })

      const page = new Pagination(query.page, query.size)

      const result = await TransactionsModel.findAndCountAll({
        where: {
          ...(Boolean(user?.dataValues.userRole === 'user') && {
            transactionUserId: { [Op.eq]: userId }
          }),
          deleted: { [Op.eq]: 0 },
          ...(Boolean(query.search) && {
            [Op.or]: [{ transactionId: { [Op.like]: `%${query.search}%` } }]
          })
        },
        include: [
          {
            model: UserModel,
            attributes: ['userId', 'userName']
          },
          { model: OrdersModel }
        ],
        order: [['transactionId', 'desc']],
        ...(query.pagination === true && {
          limit: page.limit,
          offset: page.offset
        })
      })

      return page.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[TransactionService] findAllTransactions failed: ${String(error)}`)
      throw new AppError(
        'Gagal mengambil daftar transaksi',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findDetailTransaction(params: ITransactionDetailParams) {
    try {
      const result = await TransactionsModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          transactionId: { [Op.eq]: params.transactionId }
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
        throw new AppError('not found!', StatusCodes.NOT_FOUND)
      }

      return result
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[TransactionService] findDetailTransaction failed: ${String(error)}`)
      throw new AppError(
        'Gagal mengambil detail transaksi',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async createTransaction(userId: number, body: ICreateTransactionBody) {
    try {
      const payload = {
        ...body,
        transactionUserId: String(userId),
        deleted: 0
      }

      await TransactionsModel.create(payload as any)
      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[TransactionService] createTransaction failed: ${String(error)}`)
      throw new AppError('Gagal membuat transaksi', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateTransaction(body: IUpdateTransactionBody) {
    try {
      const existing = await TransactionsModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          transactionId: { [Op.eq]: body.transactionId }
        }
      })

      if (existing == null) {
        throw new AppError('not found!', StatusCodes.NOT_FOUND)
      }

      const updatePayload: Record<string, unknown> = {}

      if (body.transactionStatus != null) {
        updatePayload.transactionStatus = body.transactionStatus
      }
      if (body.transactionPaymentType != null) {
        updatePayload.transactionPaymentType = body.transactionPaymentType
      }
      if (body.transactionRawResponse != null) {
        updatePayload.transactionRawResponse = body.transactionRawResponse
      }

      await existing.update(updatePayload)

      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[TransactionService] updateTransaction failed: ${String(error)}`)
      throw new AppError('Gagal memperbarui transaksi', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async removeTransaction(query: IRemoveTransactionQuery) {
    try {
      const row = await TransactionsModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          transactionId: { [Op.eq]: query.transactionId }
        }
      })

      if (row == null) {
        throw new AppError('transation not found!', StatusCodes.NOT_FOUND)
      }

      row.deleted = 1
      await row.save()
      return { message: 'success' as const }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[TransactionService] removeTransaction failed: ${String(error)}`)
      throw new AppError('Gagal menghapus transaksi', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
