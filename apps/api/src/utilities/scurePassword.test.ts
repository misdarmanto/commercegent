import { hashPassword } from './scurePassword'

describe('hashPassword', () => {
  it('returns a 40-character hex sha1 digest', () => {
    const hash = hashPassword('super-secret')
    expect(hash).toMatch(/^[a-f0-9]{40}$/)
  })

  it('is deterministic for the same input', () => {
    expect(hashPassword('password123')).toBe(hashPassword('password123'))
  })

  it('produces different hashes for different passwords', () => {
    expect(hashPassword('password123')).not.toBe(hashPassword('password124'))
  })
})
