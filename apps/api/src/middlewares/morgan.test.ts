import morgan from 'morgan'
import { loggerMidleWare } from './morgan'
import logger from '../utilities/logger'

jest.mock('morgan', () => jest.fn(() => 'morgan-middleware'))
jest.mock('../utilities/logger', () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() }))

const mockedMorgan = morgan as unknown as jest.Mock

describe('loggerMidleWare', () => {
  it('configures morgan with the combined format', () => {
    loggerMidleWare()

    expect(mockedMorgan).toHaveBeenCalledWith(
      'combined',
      expect.objectContaining({ stream: expect.anything() })
    )
  })

  it('forwards trimmed log lines to the shared logger', () => {
    loggerMidleWare()

    const options = mockedMorgan.mock.calls[mockedMorgan.mock.calls.length - 1][1]
    options.stream.write('  a log line  \n')

    expect(logger.info).toHaveBeenCalledWith('a log line')
  })
})
