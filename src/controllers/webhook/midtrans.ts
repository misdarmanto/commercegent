import { type Request, type Response } from 'express'
import crypto from 'crypto'
import { sequelize } from '../../models'
import { OrdersAttributes, OrdersModel } from '../../models/orders'
import { TransactionsAttributes, TransactionsModel } from '../../models/transactions'
import { ResponseData } from '../../utilities/response'
import { StatusCodes } from 'http-status-codes'
import { appConfigs } from '../../configs/appConfig'
import logger from '../../logs'

export const midtransWebhookHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  const payload = req.body

  const {
    order_id,
    transaction_status,
    status_code,
    gross_amount,
    payment_type,
    signature_key
  } = payload

  console.log('===================================')
  console.log('Midtrans Webhook Payload:', payload)

  /* ===================== 1. SIGNATURE VALIDATION ===================== */

  const expectedSignature = crypto
    .createHash('sha512')
    .update(order_id + status_code + gross_amount + appConfigs.midtrans.serverKey)
    .digest('hex')

  if (signature_key !== expectedSignature) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ResponseData.error('Invalid signature'))
  }

  console.log('=================================== case 1 passed======')
  /* ===================== 2. DB TRANSACTION ===================== */

  const dbTransaction = await sequelize.transaction()

  try {
    const order = await OrdersModel.findOne({
      where: { orderReferenceId: order_id },
      transaction: dbTransaction
    })

    if (!order) {
      await dbTransaction.rollback()
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error('Order not found'))
    }

    console.log('=================================== case 2 passed======')

    const FINAL_ORDER_STATUS = ['process', 'cancel']
    const FINAL_TRANSACTION_STATUS = ['success', 'failed', 'expire', 'cancel']

    /* ===================== 3. MAP STATUS ===================== */

    let transactionStatus: 'pending' | 'success' | 'failed' | 'expire' | 'cancel'
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

    console.log('=================================== case 3 passed======')
    /* ===================== 4. UPDATE ORDER ===================== */

    if (!FINAL_ORDER_STATUS.includes(order.orderStatus)) {
      await order.update({ orderStatus }, { transaction: dbTransaction })
    }

    console.log('=================================== case 4 passed======')
    /* ===================== 5. UPSERT TRANSACTION ===================== */
    if (order.orderStatus !== 'cancel') {
      console.log('=================================== case 5 passed======')
      const existingTransaction = await TransactionsModel.findOne({
        where: {
          transactionOrderId: order.orderId
        },
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

      console.log('=================================== case 6 passed======')
      if (existingTransaction) {
        if (!FINAL_TRANSACTION_STATUS.includes(existingTransaction.transactionStatus)) {
          await existingTransaction.update(transactionPayload, {
            transaction: dbTransaction
          })
        }
        console.log('=================================== case 7 passed======')
      } else {
        await TransactionsModel.create(transactionPayload, {
          transaction: dbTransaction
        })
      }
    }

    await dbTransaction.commit()
    console.log('=================================== case 8 passed======')

    return res.status(StatusCodes.OK).json(ResponseData.default)
  } catch (error) {
    await dbTransaction.rollback()
    logger.error('Midtrans Webhook Error:', error)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ResponseData.error('Webhook processing failed'))
  }
}
