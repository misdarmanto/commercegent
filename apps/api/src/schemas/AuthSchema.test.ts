import {
  loginAdminSchema,
  loginUserSchema,
  signupAdminSchema,
  signupUserSchema
} from './AuthSchema'

describe('loginAdminSchema', () => {
  it('accepts a valid login payload', () => {
    const result = loginAdminSchema.safeParse({
      adminWhatsAppNumber: '628123456789',
      adminPassword: 'secret'
    })
    expect(result.success).toBe(true)
  })

  it('rejects a missing password', () => {
    const result = loginAdminSchema.safeParse({ adminWhatsAppNumber: '628123456789' })
    expect(result.success).toBe(false)
  })
})

describe('loginUserSchema', () => {
  it('rejects a non-string whatsapp number', () => {
    const result = loginUserSchema.safeParse({ userWhatsAppNumber: 12345, userPassword: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('signupAdminSchema', () => {
  it('requires a password of at least 6 characters', () => {
    const tooShort = signupAdminSchema.safeParse({
      adminName: 'Admin',
      adminPassword: '123',
      adminWhatsAppNumber: '628123456789'
    })
    expect(tooShort.success).toBe(false)

    const valid = signupAdminSchema.safeParse({
      adminName: 'Admin',
      adminPassword: '123456',
      adminWhatsAppNumber: '628123456789'
    })
    expect(valid.success).toBe(true)
  })
})

describe('signupUserSchema', () => {
  it('requires a password of at least 6 characters', () => {
    const result = signupUserSchema.safeParse({
      userName: 'User',
      userPassword: 'abcde',
      userWhatsAppNumber: '628123456789'
    })
    expect(result.success).toBe(false)
  })
})
