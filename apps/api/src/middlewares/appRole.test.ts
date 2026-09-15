import { StatusCodes } from 'http-status-codes'
import { allowAppRoles } from './appRole'

function mockRes() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('allowAppRoles', () => {
  it('returns 401 when there is no jwtPayload on the request', () => {
    const req: any = {}
    const res = mockRes()
    const next = jest.fn()

    allowAppRoles('admin')(req, res, next)

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unauthorized! Mising Token' })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when the user role is not in the allowed list', () => {
    const req: any = { jwtPayload: { userId: 1, userRole: 'user' } }
    const res = mockRes()
    const next = jest.fn()

    allowAppRoles('admin', 'superAdmin')(req, res, next)

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Forbidden: Insufficient role' })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next() when the user role is allowed', () => {
    const req: any = { jwtPayload: { userId: 1, userRole: 'admin' } }
    const res = mockRes()
    const next = jest.fn()

    allowAppRoles('admin', 'superAdmin')(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })
})
