import { StatusCodes } from 'http-status-codes'
import { AuthService } from './Auth.service'
import { UserModel } from '../models/UserModel'
import { AppError } from '../utilities/appError'
import { hashPassword } from '../utilities/scurePassword'

jest.mock('../models/UserModel', () => ({
  UserModel: { findOne: jest.fn(), create: jest.fn() }
}))

jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindOne = UserModel.findOne as jest.Mock
const mockedCreate = UserModel.create as jest.Mock

describe('AuthService.userLogin', () => {
  const payload = { userWhatsAppNumber: '628123456789', userPassword: 'secret123' }

  it('returns a token when credentials are valid', async () => {
    mockedFindOne.mockResolvedValue({
      userId: 1,
      userRole: 'user',
      userPassword: hashPassword('secret123')
    })

    const result = await AuthService.userLogin(payload as any)

    expect(result).toEqual({ token: expect.any(String) })
  })

  it('throws a 404 AppError when the user does not exist', async () => {
    mockedFindOne.mockResolvedValue(null)

    await expect(AuthService.userLogin(payload as any)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })

  it('throws a 401 AppError when the password is wrong', async () => {
    mockedFindOne.mockResolvedValue({
      userId: 1,
      userRole: 'user',
      userPassword: hashPassword('a-different-password')
    })

    await expect(AuthService.userLogin(payload as any)).rejects.toMatchObject({
      statusCode: StatusCodes.UNAUTHORIZED
    })
  })

  it('wraps unexpected errors into a 500 AppError', async () => {
    mockedFindOne.mockRejectedValue(new Error('connection lost'))

    await expect(AuthService.userLogin(payload as any)).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to login'
    })
  })
})

describe('AuthService.userSignup', () => {
  const payload = {
    userName: 'Jane',
    userWhatsAppNumber: '628123456789',
    userPassword: 'secret123',
    userGender: 'wanita'
  }

  it('creates a user with a hashed password when the number is not registered', async () => {
    mockedFindOne.mockResolvedValue(null)
    mockedCreate.mockResolvedValue(undefined)

    await AuthService.userSignup(payload as any)

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userName: 'Jane',
        userWhatsAppNumber: '628123456789',
        userPassword: hashPassword('secret123'),
        userRole: 'user',
        deleted: false,
        userPartnerCode: expect.stringContaining('628123456789')
      })
    )
  })

  it('throws a 400 AppError when the whatsapp number is already registered', async () => {
    mockedFindOne.mockResolvedValue({ userId: 1 })

    await expect(AuthService.userSignup(payload as any)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST
    })
    expect(mockedCreate).not.toHaveBeenCalled()
  })
})

describe('AuthService.loginAdmin', () => {
  const payload = { adminWhatsAppNumber: '628123456789', adminPassword: 'secret123' }

  it('returns a token for a valid admin login', async () => {
    mockedFindOne.mockResolvedValue({
      userId: 1,
      userRole: 'admin',
      userPassword: hashPassword('secret123')
    })

    const result = await AuthService.loginAdmin(payload as any)
    expect(result).toEqual({ token: expect.any(String) })
  })

  it('rethrows AppError as-is instead of masking it', async () => {
    mockedFindOne.mockResolvedValue(null)

    await expect(AuthService.loginAdmin(payload as any)).rejects.toBeInstanceOf(AppError)
  })
})
