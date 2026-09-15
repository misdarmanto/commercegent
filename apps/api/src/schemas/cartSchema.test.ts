import {
  createCartSchema,
  removeCartQuerySchema,
  findAllCartSchema,
  updateCartSchema
} from './cartSchema'

describe('createCartSchema', () => {
  it('accepts a valid payload and coerces numeric strings', () => {
    const result = createCartSchema.parse({
      cartProductId: '1',
      cartProductVariantId: '2',
      cartQuantity: '3'
    })

    expect(result).toEqual({ cartProductId: 1, cartProductVariantId: 2, cartQuantity: 3 })
  })

  it('rejects a non-positive cartProductId', () => {
    const result = createCartSchema.safeParse({
      cartProductId: 0,
      cartProductVariantId: 1,
      cartQuantity: 1
    })

    expect(result.success).toBe(false)
  })

  it('rejects cartQuantity below 1', () => {
    const result = createCartSchema.safeParse({
      cartProductId: 1,
      cartProductVariantId: 1,
      cartQuantity: 0
    })

    expect(result.success).toBe(false)
  })

  it('rejects a non-numeric cartProductId', () => {
    const result = createCartSchema.safeParse({
      cartProductId: 'abc',
      cartProductVariantId: 1,
      cartQuantity: 1
    })

    expect(result.success).toBe(false)
  })
})

describe('removeCartQuerySchema', () => {
  it('accepts a positive cartId', () => {
    expect(removeCartQuerySchema.parse({ cartId: '5' })).toEqual({ cartId: 5 })
  })

  it('rejects a negative cartId', () => {
    expect(removeCartQuerySchema.safeParse({ cartId: -1 }).success).toBe(false)
  })
})

describe('findAllCartSchema', () => {
  it('defaults page to 1 and size to 20', () => {
    expect(findAllCartSchema.parse({})).toEqual({ page: 1, size: 20, pagination: false })
  })

  it('rejects a size above 100', () => {
    expect(findAllCartSchema.safeParse({ size: 101 }).success).toBe(false)
  })

  it('treats an empty search string as undefined', () => {
    expect(findAllCartSchema.parse({ search: '' }).search).toBeUndefined()
  })

  it('transforms the pagination flag string into a boolean', () => {
    expect(findAllCartSchema.parse({ pagination: 'true' }).pagination).toBe(true)
    expect(findAllCartSchema.parse({ pagination: 'false' }).pagination).toBe(false)
  })
})

describe('updateCartSchema', () => {
  it('accepts a valid update payload', () => {
    const result = updateCartSchema.parse({ cartId: 1, cartQuantity: 2 })
    expect(result).toEqual({ cartId: 1, cartQuantity: 2 })
  })

  it('rejects a fractional cartQuantity', () => {
    expect(updateCartSchema.safeParse({ cartId: 1, cartQuantity: 1.5 }).success).toBe(false)
  })
})
