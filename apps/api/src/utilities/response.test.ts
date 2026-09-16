import { ResponseData } from './response'

describe('ResponseData.success', () => {
  it('builds a success envelope with the given data and default message', () => {
    const result = ResponseData.success({ data: { id: 1 } })

    expect(result.success).toBe(true)
    expect(result.message).toBe('Request successful')
    expect(result.data).toEqual({ id: 1 })
    expect(result.meta).toEqual(
      expect.objectContaining({
        version: expect.any(String),
        timestamp: expect.any(String)
      })
    )
  })

  it('allows overriding the message and carries execution/request ids into meta', () => {
    const result = ResponseData.success({
      data: null,
      message: 'Created',
      executionTime: '12ms',
      requestId: 'req-1'
    })

    expect(result.message).toBe('Created')
    expect(result.meta.executionTime).toBe('12ms')
    expect(result.meta.requestId).toBe('req-1')
  })
})

describe('ResponseData.error', () => {
  it('builds an error envelope with success=false and null data', () => {
    const result = ResponseData.error({})

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.message).toBe('Something went wrong')
  })

  it('allows overriding the error message', () => {
    const result = ResponseData.error({ message: 'Product not found' })
    expect(result.message).toBe('Product not found')
  })
})
