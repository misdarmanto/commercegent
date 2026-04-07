import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'
import { sequelize } from '../models'
import { OrdersModel, type OrdersAttributes } from '../models/orders'
import { TransactionsModel, type TransactionsAttributes } from '../models/transactions'
import { appConfigs } from '../configs/appConfig'
import { AppError } from '../utilities/appError'
import logger from '../utilities/logger'
import type { IBitshipWebhook, IMidtransWebhook } from '../schemas/WebhookSchema'

export class WebhookService {
  static async handleMidtransWebhook(payload: IMidtransWebhook) {
    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      payment_type,
      signature_key
    } = payload

    const expectedSignature = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + appConfigs.midtrans.serverKey)
      .digest('hex')

    if (signature_key !== expectedSignature) {
      throw new AppError('Invalid signature', StatusCodes.UNAUTHORIZED)
    }

    const dbTransaction = await sequelize.transaction()

    try {
      const order = await OrdersModel.findOne({
        where: { orderReferenceId: order_id },
        transaction: dbTransaction
      })

      if (order == null) {
        await dbTransaction.rollback()
        throw new AppError('Order not found', StatusCodes.NOT_FOUND)
      }

      const FINAL_ORDER_STATUS: OrdersAttributes['orderStatus'][] = ['process', 'cancel']
      const FINAL_TRANSACTION_STATUS: TransactionsAttributes['transactionStatus'][] = [
        'success',
        'failed',
        'expire',
        'cancel'
      ]

      let transactionStatus: TransactionsAttributes['transactionStatus']
      let orderStatus: OrdersAttributes['orderStatus']

      switch (transaction_status) {
        case 'capture':
        case 'settlement':
          transactionStatus = 'success'
          orderStatus = 'process'
          break
        case 'pending':
          transactionStatus = 'pending'
          orderStatus = 'waiting'
          break
        case 'deny':
          transactionStatus = 'failed'
          orderStatus = 'cancel'
          break
        case 'expire':
          transactionStatus = 'expire'
          orderStatus = 'cancel'
          break
        case 'cancel':
          transactionStatus = 'cancel'
          orderStatus = 'cancel'
          break
        default:
          transactionStatus = 'failed'
          orderStatus = 'cancel'
          break
      }

      if (!FINAL_ORDER_STATUS.includes(order.orderStatus)) {
        await order.update({ orderStatus }, { transaction: dbTransaction })
      }

      // Only create/update transaction if order is not cancelled
      if (orderStatus !== 'cancel') {
        const existingTransaction = await TransactionsModel.findOne({
          where: { transactionOrderId: order.orderId },
          transaction: dbTransaction
        })

        const transactionPayload = {
          transactionOrderId: order.orderId,
          transactionUserId: order.orderUserId,
          transactionAmount: Number(order.orderGrandTotal),
          transactionOngkirPrice: Number(order.orderShippingFee),
          transactionProvider: 'midtrans',
          transactionPaymentType: payment_type,
          transactionStatus,
          transactionRawResponse: payload
        } as TransactionsAttributes

        if (existingTransaction != null) {
          if (!FINAL_TRANSACTION_STATUS.includes(existingTransaction.transactionStatus)) {
            await existingTransaction.update(transactionPayload, {
              transaction: dbTransaction
            })
          }
        } else {
          await TransactionsModel.create(transactionPayload, {
            transaction: dbTransaction
          })
        }
      }

      await dbTransaction.commit()
      return { message: 'success' as const }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[WebhookService] midtrans failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to process midtrans webhook',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async handleBitshipWebhook(payload: IBitshipWebhook) {
    try {
      const order = await OrdersModel.findOne({
        where: {
          deleted: 0,
          orderWaybillId: payload.courier_waybill_id
        }
      })

      if (order != null && payload.status === 'delivered') {
        await order.update({ orderStatus: 'done' })
      }

      return { message: 'success' as const }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[WebhookService] bitship failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to process bitship webhook',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
