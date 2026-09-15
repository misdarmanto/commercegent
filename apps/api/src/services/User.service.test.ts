import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { UserService } from './User.service'
import { UserModel } from '../models/UserModel'
import { hashPassword } from '../utilities/scurePassword'

jest.mock('../models/UserModel', () => ({
  UserModel: { findAndCountAll: jest.fn(), findOne: jest.fn() }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAndCountAll = UserModel.findAndCountAll as jest.Mock
const mockedFindOne = UserModel.findOne as jest.Mock

describe('UserService.findAllUsers', () => {
  it('defaults the role filter to "user" when none is provided', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 0, rows: [] })

    await UserService.findAllUsers({ page: 1, size: 10 } as any)

    const where = mockedFindAndCountAll.mock.calls[0][0].where
    expect(where.userRole).toEqual({ [Op.eq]: 'user' })
  })
})

describe('UserService.findDetailUser', () => {
  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(UserService.findDetailUser({ userId: 1 } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })
})

describe('UserService.updateSelf', () => {
  it('throws a 404 AppError when the user does not exist', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(UserService.updateSelf(1, {} as any)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })

  it('only includes provided, non-empty fields and hashes the password', async () => {
    const user = { update: jest.fn() }
    mockedFindOne.mockResolvedValue(user)

    await UserService.updateSelf(1, { userName: 'Jane', userPassword: 'secret123' } as any)

    expect(user.update).toHaveBeenCalledWith({
      userName: 'Jane',
      userPassword: hashPassword('secret123')
    })
  })
})

describe('UserService.removeUser', () => {
  it('soft-deletes the user', async () => {
    const user = { deleted: false, save: jest.fn() }
    mockedFindOne.mockResolvedValue(user)

    await UserService.removeUser({ userId: 1 } as any)

    expect(user.deleted).toBe(true)
    expect(user.save).toHaveBeenCalled()
  })

  it('throws a 404 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(UserService.removeUser({ userId: 1 } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })
})

describe('UserService.updateUserCoin', () => {
  it('updates the coin balance', async () => {
    const user = { userCoin: 0, save: jest.fn() }
    mockedFindOne.mockResolvedValue(user)

    await UserService.updateUserCoin({ userId: 1, userCoin: 50 } as any)

    expect(user.userCoin).toBe(50)
    expect(user.save).toHaveBeenCalled()
  })
})

describe('UserService.updatePassword', () => {
  it('throws a 404 AppError when the user does not exist', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(
      UserService.updatePassword({ userWhatsAppNumber: '1', userPassword: 'x' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('hashes the new password before updating', async () => {
    const user = { update: jest.fn() }
    mockedFindOne.mockResolvedValue(user)

    await UserService.updatePassword({
      userWhatsAppNumber: '628123456789',
      userPassword: 'newsecret'
    } as any)

    expect(user.update).toHaveBeenCalledWith({ userPassword: hashPassword('newsecret') })
  })
})
