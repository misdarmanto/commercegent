import { StatusCodes } from 'http-status-codes'
import { MidtransAPIService } from './Midtrans.service'
import { AppError } from '../../utilities/appError'

const mockCreateTransaction = jest.fn()
jest.mock('midtrans-client', () => ({
  Snap: jest.fn().mockImplementation(() => ({ createTransaction: mockCreateTransaction }))
}))
jest.mock('../../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

describe('MidtransAPIService.createTransaction', () => {
  it('returns the transaction data from the Midtrans Snap client', async () => {
    mockCreateTransaction.mockResolvedValue({ token: 'snap-token', redirect_url: 'https://x' })

    const result = await MidtransAPIService.createTransaction({ transaction_details: {} })

    expect(result).toEqual({ token: 'snap-token', redirect_url: 'https://x' })
  })

  it('wraps an unexpected failure into a 500 AppError', async () => {
    mockCreateTransaction.mockRejectedValue(new Error('midtrans down'))

    await expect(MidtransAPIService.createTransaction({})).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to create transaction'
    })
  })

  it('rethrows an existing AppError untouched', async () => {
    const conflict = AppError.conflict('duplicate order id')
    mockCreateTransaction.mockRejectedValue(conflict)

    await expect(MidtransAPIService.createTransaction({})).rejects.toBe(conflict)
  })
})
