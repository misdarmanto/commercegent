import { StatusCodes } from 'http-status-codes'
import { OtpService } from './Otp.service'
import { UserModel } from '../models/UserModel'
import { WablasAPIService } from './external/WablasApi.service'
import redis from '../configs/redis'

jest.mock('../models/UserModel', () => ({ UserModel: { findOne: jest.fn() } }))
jest.mock('./external/WablasApi.service', () => ({
  WablasAPIService: { sendMessage: jest.fn() }
}))
jest.mock('../configs/redis', () => ({
  __esModule: true,
  default: { setex: jest.fn(), get: jest.fn(), del: jest.fn() }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindOne = UserModel.findOne as jest.Mock
const mockedSendMessage = WablasAPIService.sendMessage as jest.Mock
const mockedRedis = redis as unknown as { setex: jest.Mock; get: jest.Mock; del: jest.Mock }

describe('OtpService.requestOtp', () => {
  it('rejects a resetPassword request for an unregistered number', async () => {
    mockedFindOne.mockResolvedValue(null)

    await expect(
      OtpService.requestOtp({ whatsappNumber: '628123456789', otpType: 'resetPassword' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
    expect(mockedSendMessage).not.toHaveBeenCalled()
  })

  it('rejects a register request for an already-registered number', async () => {
    mockedFindOne.mockResolvedValue({ userId: 1 })

    await expect(
      OtpService.requestOtp({ whatsappNumber: '628123456789', otpType: 'register' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })

  it('stores the OTP in redis and sends it over WhatsApp for a valid register request', async () => {
    mockedFindOne.mockResolvedValue(null)
    mockedRedis.setex.mockResolvedValue('OK')
    mockedSendMessage.mockResolvedValue(undefined)

    await OtpService.requestOtp({ whatsappNumber: '628123456789', otpType: 'register' } as any)

    expect(mockedRedis.setex).toHaveBeenCalledWith(
      expect.stringMatching(/^otp:\d{6}$/),
      5 * 60,
      expect.stringMatching(/^\d{6}$/)
    )
    expect(mockedSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '628123456789' })
    )
  })
})

describe('OtpService.verifyOtp', () => {
  it('deletes the OTP from redis when it matches', async () => {
    mockedRedis.get.mockResolvedValue('123456')

    await OtpService.verifyOtp({ otpCode: '123456' } as any)

    expect(mockedRedis.del).toHaveBeenCalledWith('otp:123456')
  })

  it('throws a 400 AppError when the OTP does not match', async () => {
    mockedRedis.get.mockResolvedValue('654321')

    await expect(OtpService.verifyOtp({ otpCode: '123456' } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST
    })
  })

  it('throws a 400 AppError when the OTP has expired', async () => {
    mockedRedis.get.mockResolvedValue(null)

    await expect(OtpService.verifyOtp({ otpCode: '123456' } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST
    })
  })
})
