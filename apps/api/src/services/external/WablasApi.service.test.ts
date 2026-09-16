import axios from 'axios'
import { StatusCodes } from 'http-status-codes'
import { WablasAPIService } from './WablasApi.service'

jest.mock('axios')
jest.mock('../../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('WablasAPIService.sendMessage', () => {
  const payload = { phone: '628123456789', message: 'hello' }

  it('returns the response data on a 200 response', async () => {
    mockedAxios.get.mockResolvedValue({ status: 200, data: { sent: true } })

    const result = await WablasAPIService.sendMessage(payload)
    expect(result).toEqual({ sent: true })
  })

  it('throws a 502 AppError when the response status is not 200', async () => {
    mockedAxios.get.mockResolvedValue({ status: 500, data: {} })

    await expect(WablasAPIService.sendMessage(payload)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_GATEWAY
    })
  })

  it('throws a 502 AppError when the request itself fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('network error'))

    await expect(WablasAPIService.sendMessage(payload)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_GATEWAY
    })
  })
})
