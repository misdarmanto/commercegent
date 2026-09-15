import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { CategoryService } from './Category.service'
import { CategoryModel } from '../models/CategoryModel'

jest.mock('../models/CategoryModel', () => ({
  CategoryModel: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAndCountAll = CategoryModel.findAndCountAll as jest.Mock
const mockedFindOne = CategoryModel.findOne as jest.Mock
const mockedCreate = CategoryModel.create as jest.Mock
const mockedUpdate = CategoryModel.update as jest.Mock

describe('CategoryService.findAllCategories', () => {
  it('builds a search filter using a LIKE clause', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 0, rows: [] })

    await CategoryService.findAllCategories({ page: 1, size: 10, search: 'shoes' } as any)

    const where = mockedFindAndCountAll.mock.calls[0][0].where
    expect(where.categoryName).toEqual({ [Op.like]: '%shoes%' })
  })

  it('formats the paginated result', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 3, rows: [{ categoryId: 1 }] })

    const result = await CategoryService.findAllCategories({ page: 1, size: 10 } as any)
    expect(result.totalItems).toBe(3)
  })
})

describe('CategoryService.findDetailCategory', () => {
  it('returns the category when found', async () => {
    mockedFindOne.mockResolvedValue({ categoryId: 1 })
    expect(await CategoryService.findDetailCategory({ categoryId: 1 } as any)).toEqual({
      categoryId: 1
    })
  })

  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(
      CategoryService.findDetailCategory({ categoryId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})

describe('CategoryService.createCategory', () => {
  it('defaults categoryType to parent and blank strings for optional fields', async () => {
    await CategoryService.createCategory({ categoryName: 'Shoes' } as any)

    expect(mockedCreate).toHaveBeenCalledWith({
      categoryName: 'Shoes',
      categoryType: 'parent',
      categoryReference: '',
      categoryIcon: ''
    })
  })
})

describe('CategoryService.updateCategory', () => {
  it('throws a 400 AppError when there are no fields to update', async () => {
    await expect(CategoryService.updateCategory({ categoryId: 1 } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST
    })
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('throws a 404 AppError when no row matched', async () => {
    mockedUpdate.mockResolvedValue([0])
    await expect(
      CategoryService.updateCategory({ categoryId: 1, categoryName: 'New' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})

describe('CategoryService.removeCategory', () => {
  it('resolves when a row was updated', async () => {
    mockedUpdate.mockResolvedValue([1])
    await expect(
      CategoryService.removeCategory({ categoryId: 1 } as any)
    ).resolves.toBeUndefined()
  })

  it('throws a 404 AppError when no row matched', async () => {
    mockedUpdate.mockResolvedValue([0])
    await expect(CategoryService.removeCategory({ categoryId: 1 } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })
})
