import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'
import { WebhookService } from './Webhook.service'
import { OrdersModel } from '../models/OrderModel'
import { TransactionsModel } from '../models/TransactionModel'
import { UserModel } from '../models/UserModel'
import { sequelizeInit } from '../configs/database'
import { WablasAPIService } from './external/WablasApi.service'
import { SettingService } from './Setting.service'

jest.mock('../configs/appConfig', () => ({
  appConfigs: { midtrans: { serverKey: 'test-server-key' } }
}))
jest.mock('../models/OrderModel', () => ({ OrdersModel: { findOne: jest.fn() } }))
jest.mock('../models/TransactionModel', () => ({
  TransactionsModel: { findOne: jest.fn(), create: jest.fn() }
}))
jest.mock('../models/UserModel', () => ({ UserModel: { findOne: jest.fn() } }))
jest.mock('../configs/database', () => ({ sequelizeInit: { transaction: jest.fn() } }))
jest.mock('./external/WablasApi.service', () => ({
  WablasAPIService: { sendMessage: jest.fn() }
}))
jest.mock('./Setting.service', () => ({ SettingService: { findSetting: jest.fn() } }))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedOrderFindOne = OrdersModel.findOne as jest.Mock
const mockedTransactionFindOne = TransactionsModel.findOne as jest.Mock
const mockedTransactionCreate = TransactionsModel.create as jest.Mock
const mockedUserFindOne = UserModel.findOne as jest.Mock
const mockedDbTransaction = sequelizeInit.transaction as jest.Mock
const mockedSendMessage = WablasAPIService.sendMessage as jest.Mock
const mockedFindSetting = SettingService.findSetting as jest.Mock

function sign(orderId: string, statusCode: string, grossAmount: string): string {
  return crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + 'test-server-key')
    .digest('hex')
}

function buildPayload(overrides: Record<string, unknown> = {}) {
  const base = {
    order_id: 'ORDER-1',
    status_code: '200',
    gross_amount: '100000',
    transaction_status: 'settlement',
    payment_type: 'bank_transfer'
  }
  const merged = { ...base, ...overrides }
  if (!('signature_key' in overrides)) {
    ;(merged as any).signature_key = sign(merged.order_id, merged.status_code, merged.gross_amount)
  }
  return merged as any
}

describe('WebhookService.handleMidtransWebhook', () => {
  let dbTransaction: { commit: jest.Mock; rollback: jest.Mock }

  beforeEach(() => {
    dbTransaction = { commit: jest.fn(), rollback: jest.fn() }
    mockedDbTransaction.mockResolvedValue(dbTransaction)
    mockedFindSetting.mockResolvedValue({ whatsappNumber: '' })
    mockedUserFindOne.mockResolvedValue(null)
  })

  it('rejects a payload with an invalid signature', async () => {
    const payload = buildPayload({ signature_key: 'wrong-signature' })

    await expect(WebhookService.handleMidtransWebhook(payload)).rejects.toMatchObject({
      statusCode: StatusCodes.UNAUTHORIZED
    })
    expect(mockedDbTransaction).not.toHaveBeenCalled()
  })

  it('throws a 404 AppError and rolls back when the order is not found', async () => {
    mockedOrderFindOne.mockResolvedValue(null)

    await expect(WebhookService.handleMidtransWebhook(buildPayload())).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
    expect(dbTransaction.rollback).toHaveBeenCalled()
    expect(dbTransaction.commit).not.toHaveBeenCalled()
  })

  it('marks the order as processing and creates a transaction on settlement', async () => {
    const order = {
      orderId: 1,
      orderUserId: 2,
      orderStatus: 'waiting',
      orderGrandTotal: 100000,
      orderShippingFee: 5000,
      update: jest.fn()
    }
    mockedOrderFindOne.mockResolvedValue(order)
    mockedTransactionFindOne.mockResolvedValue(null)

    await WebhookService.handleMidtransWebhook(buildPayload({ transaction_status: 'settlement' }))

    expect(order.update).toHaveBeenCalledWith(
      { orderStatus: 'process' },
      expect.objectContaining({ transaction: dbTransaction })
    )
    expect(mockedTransactionCreate).toHaveBeenCalledWith(
      expect.objectContaining({ transactionStatus: 'success' }),
      expect.objectContaining({ transaction: dbTransaction })
    )
    expect(dbTransaction.commit).toHaveBeenCalled()
  })

  it('does not touch the order when it is already in a final status', async () => {
    const order = {
      orderId: 1,
      orderUserId: 2,
      orderStatus: 'process',
      orderGrandTotal: 100000,
      orderShippingFee: 5000,
      update: jest.fn()
    }
    mockedOrderFindOne.mockResolvedValue(order)
    mockedTransactionFindOne.mockResolvedValue(null)

    await WebhookService.handleMidtransWebhook(buildPayload({ transaction_status: 'settlement' }))

    expect(order.update).not.toHaveBeenCalled()
  })

  it('does not create a transaction when the order is cancelled', async () => {
    const order = {
      orderId: 1,
      orderUserId: 2,
      orderStatus: 'waiting',
      update: jest.fn()
    }
    mockedOrderFindOne.mockResolvedValue(order)

    await WebhookService.handleMidtransWebhook(buildPayload({ transaction_status: 'cancel' }))

    expect(mockedTransactionCreate).not.toHaveBeenCalled()
    expect(dbTransaction.commit).toHaveBeenCalled()
  })

  it('notifies admin and user by WhatsApp after a successful payment', async () => {
    const order = {
      orderId: 1,
      orderUserId: 2,
      orderStatus: 'waiting',
      orderGrandTotal: 100000,
      orderShippingFee: 5000,
      update: jest.fn()
    }
    mockedOrderFindOne.mockResolvedValue(order)
    mockedTransactionFindOne.mockResolvedValue(null)
    mockedFindSetting.mockResolvedValue({ whatsappNumber: '6281111111111' })
    mockedUserFindOne.mockResolvedValue({ userWhatsAppNumber: '6282222222222', userName: 'Jane' })
    mockedSendMessage.mockResolvedValue(undefined)

    await WebhookService.handleMidtransWebhook(buildPayload({ transaction_status: 'settlement' }))

    expect(mockedSendMessage).toHaveBeenCalledTimes(2)
  })
})

describe('WebhookService.handleBitshipWebhook', () => {
  it('marks the order as done when delivered', async () => {
    const order = { update: jest.fn() }
    mockedOrderFindOne.mockResolvedValue(order)

    const result = await WebhookService.handleBitshipWebhook({
      courier_waybill_id: 'WB-1',
      status: 'delivered'
    } as any)

    expect(order.update).toHaveBeenCalledWith({ orderStatus: 'done' })
    expect(result).toEqual({ message: 'success' })
  })

  it('does not update the order for a non-delivered status', async () => {
    const order = { update: jest.fn() }
    mockedOrderFindOne.mockResolvedValue(order)

    await WebhookService.handleBitshipWebhook({
      courier_waybill_id: 'WB-1',
      status: 'in_transit'
    } as any)

    expect(order.update).not.toHaveBeenCalled()
  })

  it('returns success even when no matching order is found', async () => {
    mockedOrderFindOne.mockResolvedValue(null)

    const result = await WebhookService.handleBitshipWebhook({
      courier_waybill_id: 'unknown',
      status: 'delivered'
    } as any)

    expect(result).toEqual({ message: 'success' })
  })
})
