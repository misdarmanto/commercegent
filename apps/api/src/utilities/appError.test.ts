import { StatusCodes } from 'http-status-codes'
import { AppError } from './appError'

describe('AppError', () => {
  it('defaults to a 500 operational error', () => {
    const error = new AppError('boom')

    expect(error.message).toBe('boom')
    expect(error.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
    expect(error.isOperational).toBe(true)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
  })

  it('accepts a custom status code and operational flag', () => {
    const error = new AppError('nope', StatusCodes.FORBIDDEN, false)

    expect(error.statusCode).toBe(StatusCodes.FORBIDDEN)
    expect(error.isOperational).toBe(false)
  })

  it('notFound() builds a 404 error', () => {
    const error = AppError.notFound('Product not found')
    expect(error.statusCode).toBe(StatusCodes.NOT_FOUND)
    expect(error.message).toBe('Product not found')
  })

  it('badRequest() builds a 400 error', () => {
    const error = AppError.badRequest('Invalid payload')
    expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  it('conflict() builds a 409 error', () => {
    const error = AppError.conflict('Duplicate entry')
    expect(error.statusCode).toBe(StatusCodes.CONFLICT)
  })
})
