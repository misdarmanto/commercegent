import axios from 'axios'
import { BiteShipAPIService, getBiteShipErrorDetail } from './BiteShipApi.service'
import { appConfigs } from '../../configs/appConfig'

jest.mock('../../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

describe('BiteShipAPIService instance', () => {
  it('is configured with the BiteShip base URL and bearer token', () => {
    expect(BiteShipAPIService.defaults.baseURL).toBe(appConfigs.biteShip.baseURL)
    expect(BiteShipAPIService.defaults.headers.Authorization).toBe(
      `Bearer ${appConfigs.biteShip.apiKey}`
    )
  })
})

describe('getBiteShipErrorDetail', () => {
  it('serializes an axios error into a JSON string with key request/response fields', () => {
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)

    const detail = getBiteShipErrorDetail({
      message: 'Request failed',
      response: { status: 404, statusText: 'Not Found', data: { error: 'not found' } },
      config: { method: 'get', url: '/rates' }
    })

    expect(JSON.parse(detail)).toEqual({
      message: 'Request failed',
      status: 404,
      statusText: 'Not Found',
      method: 'get',
      url: '/rates',
      responseData: { error: 'not found' }
    })
  })

  it('falls back to String(error) for a non-axios error', () => {
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(false)

    expect(getBiteShipErrorDetail(new Error('boom'))).toBe('Error: boom')
  })
})
