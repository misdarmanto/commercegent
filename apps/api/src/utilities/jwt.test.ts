import { generateAccessToken, verifyAccessToken } from './jwt'
import { IJwtPayload } from '../interfaces/shared'

describe('jwt utilities', () => {
  const payload: IJwtPayload = { userId: 1, userRole: 'user' }

  it('generates a token that verifies back to the original payload', () => {
    const token = generateAccessToken(payload)
    const decoded = verifyAccessToken(token) as IJwtPayload

    expect(decoded.userId).toBe(payload.userId)
    expect(decoded.userRole).toBe(payload.userRole)
  })

  it('returns false for a malformed token', () => {
    expect(verifyAccessToken('not-a-real-token')).toBe(false)
  })

  it('returns false for a tampered token', () => {
    const token = generateAccessToken(payload)
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a')

    expect(verifyAccessToken(tampered)).toBe(false)
  })
})
