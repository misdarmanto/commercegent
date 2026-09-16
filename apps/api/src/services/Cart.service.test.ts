import { StatusCodes } from 'http-status-codes'
import { CartService } from './Cart.service'
import { CartsModel } from '../models/CartModel'

jest.mock('../models/CartModel', () => ({
  CartsModel: {
    findAndCountAll: jest.fn(),
    sum: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))
jest.mock('../models/ProductModel', () => ({ ProductModel: {} }))
jest.mock('../models/ProductVariantModel', () => ({ ProductVariantModel: {} }))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAndCountAll = CartsModel.findAndCountAll as jest.Mock
const mockedSum = CartsModel.sum as jest.Mock
const mockedFindOne = CartsModel.findOne as jest.Mock
const mockedCreate = CartsModel.create as jest.Mock
const mockedUpdate = CartsModel.update as jest.Mock

describe('CartService.findAllCarts', () => {
  it('formats paginated results using the Pagination utility', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 25, rows: [{ cartId: 1 }] })

    const result = await CartService.findAllCarts(1, { page: 2, size: 10, pagination: true })

    expect(result).toEqual({
      totalItems: 25,
      items: [{ cartId: 1 }],
      totalPages: 3,
      currentPage: 2
    })
    expect(mockedFindAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, offset: 10 })
    )
  })

  it('does not pass limit/offset when pagination is disabled', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 2, rows: [] })

    await CartService.findAllCarts(1, { page: 1, size: 10, pagination: false })

    const callArgs = mockedFindAndCountAll.mock.calls[0][0]
    expect(callArgs.limit).toBeUndefined()
    expect(callArgs.offset).toBeUndefined()
  })
})

describe('CartService.findTotalCart', () => {
  it('returns the summed quantity', async () => {
    mockedSum.mockResolvedValue(7)
    expect(await CartService.findTotalCart(1)).toEqual({ total: 7 })
  })

  it('returns 0 when there are no cart rows', async () => {
    mockedSum.mockResolvedValue(null)
    expect(await CartService.findTotalCart(1)).toEqual({ total: 0 })
  })
})

describe('CartService.createCart', () => {
  it('increments the quantity of an existing cart line', async () => {
    const existing = { cartQuantity: 2, save: jest.fn() }
    mockedFindOne.mockResolvedValue(existing)

    await CartService.createCart(1, { cartProductId: 1, cartProductVariantId: 1, cartQuantity: 3 })

    expect(existing.cartQuantity).toBe(5)
    expect(existing.save).toHaveBeenCalled()
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('creates a new cart line when none exists', async () => {
    mockedFindOne.mockResolvedValue(null)

    await CartService.createCart(1, { cartProductId: 1, cartProductVariantId: 1, cartQuantity: 3 })

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ cartUserId: 1, cartQuantity: 3, deleted: false })
    )
  })
})

describe('CartService.removeCart', () => {
  it('resolves when a row was updated', async () => {
    mockedUpdate.mockResolvedValue([1])
    await expect(CartService.removeCart(1, { cartId: 1 })).resolves.toBeUndefined()
  })

  it('throws a 404 AppError when no row matched', async () => {
    mockedUpdate.mockResolvedValue([0])
    await expect(CartService.removeCart(1, { cartId: 1 })).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })
})

describe('CartService.updateCart', () => {
  it('resolves when a row was updated', async () => {
    mockedUpdate.mockResolvedValue([1])
    await expect(
      CartService.updateCart(1, { cartId: 1, cartQuantity: 5 })
    ).resolves.toBeUndefined()
  })

  it('throws a 404 AppError when no row matched', async () => {
    mockedUpdate.mockResolvedValue([0])
    await expect(
      CartService.updateCart(1, { cartId: 1, cartQuantity: 5 })
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})
