import { StatusCodes } from 'http-status-codes'
import { authorization } from './authorization'
import { verifyAccessToken } from '../utilities/jwt'
import { handleError } from '../utilities/requestHandler'

jest.mock('../utilities/jwt', () => ({ verifyAccessToken: jest.fn() }))
jest.mock('../utilities/requestHandler', () => ({ handleError: jest.fn() }))

const mockedVerify = verifyAccessToken as jest.Mock
const mockedHandleError = handleError as jest.Mock

function mockRes() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('authorization middleware', () => {
  it('returns 400 when the Authorization header is missing', () => {
    const req: any = { headers: {} }
    const res = mockRes()
    const next = jest.fn()

    authorization(req, res, next)

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 400 when the header does not use the Bearer scheme', () => {
    const req: any = { headers: { authorization: 'Basic abc123' } }
    const res = mockRes()
    const next = jest.fn()

    authorization(req, res, next)

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST)
  })

  it('returns 401 when the token fails verification', () => {
    mockedVerify.mockReturnValue(false)
    const req: any = { headers: { authorization: 'Bearer bad-token' } }
    const res = mockRes()
    const next = jest.fn()

    authorization(req, res, next)

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
    expect(next).not.toHaveBeenCalled()
  })

  it('attaches the decoded payload and calls next() for a valid token', () => {
    mockedVerify.mockReturnValue({ userId: 1, userRole: 'user' })
    const req: any = { headers: { authorization: 'Bearer good-token' } }
    const res = mockRes()
    const next = jest.fn()

    authorization(req, res, next)

    expect(req.jwtPayload).toEqual({ userId: 1, userRole: 'user' })
    expect(next).toHaveBeenCalled()
  })

  it('delegates to handleError when verification throws', () => {
    mockedVerify.mockImplementation(() => {
      throw new Error('boom')
    })
    const req: any = { headers: { authorization: 'Bearer x' } }
    const res = mockRes()
    const next = jest.fn()

    authorization(req, res, next)

    expect(mockedHandleError).toHaveBeenCalledWith(res, expect.any(Error))
  })
})
