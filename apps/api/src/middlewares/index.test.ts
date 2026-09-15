import { MiddleWares } from './index'

describe('MiddleWares barrel export', () => {
  it('exposes every middleware factory as a function', () => {
    const functionKeys = [
      'authorization',
      'corsOrigin',
      'limiter',
      'loggerMidleWare',
      'allowAppRoles',
      'validate'
    ]

    for (const key of functionKeys) {
      expect(MiddleWares).toHaveProperty(key)
      expect(typeof (MiddleWares as any)[key]).toBe('function')
    }
  })

  it('exposes uploadMidleWare as a configured multer instance', () => {
    expect(MiddleWares.uploadMidleWare).toBeDefined()
    expect(typeof MiddleWares.uploadMidleWare.single).toBe('function')
  })
})
