import rateLimit from 'express-rate-limit'
import { limiter } from './limiter'
import { appConfigs } from '../configs/appConfig'

jest.mock('express-rate-limit', () => jest.fn(() => 'rate-limit-middleware'))
jest.mock('../configs/appConfig', () => ({
  appConfigs: { rateLimit: { windowMinutes: undefined, maxRequest: undefined } }
}))

const mockedRateLimit = rateLimit as unknown as jest.Mock

describe('limiter', () => {
  afterEach(() => {
    ;(appConfigs.rateLimit as any).windowMinutes = undefined
    ;(appConfigs.rateLimit as any).maxRequest = undefined
  })

  it('defaults to a 15 minute window and 100 max requests', () => {
    limiter()

    expect(mockedRateLimit).toHaveBeenCalledWith({ windowMs: 15 * 60 * 1000, max: 100 })
  })

  it('uses the configured window and max request values', () => {
    ;(appConfigs.rateLimit as any).windowMinutes = '30'
    ;(appConfigs.rateLimit as any).maxRequest = '50'

    limiter()

    expect(mockedRateLimit).toHaveBeenCalledWith({ windowMs: 30 * 60 * 1000, max: 50 })
  })
})
