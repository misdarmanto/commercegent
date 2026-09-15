import cors from 'cors'
import { corsOrigin } from './cors'
import { appConfigs } from '../configs/appConfig'

jest.mock('cors', () => jest.fn(() => 'cors-middleware'))
jest.mock('../configs/appConfig', () => ({ appConfigs: { cors: { origin: undefined } } }))

const mockedCors = cors as unknown as jest.Mock

describe('corsOrigin', () => {
  afterEach(() => {
    ;(appConfigs.cors as any).origin = undefined
  })

  it('defaults to localhost:5173 when no origin is configured', () => {
    corsOrigin()

    expect(mockedCors).toHaveBeenCalledWith({
      origin: ['http://localhost:5173'],
      credentials: true
    })
  })

  it('splits a comma-separated origin list from config', () => {
    ;(appConfigs.cors as any).origin = 'https://a.com,https://b.com'

    corsOrigin()

    expect(mockedCors).toHaveBeenCalledWith({
      origin: ['https://a.com', 'https://b.com'],
      credentials: true
    })
  })
})
