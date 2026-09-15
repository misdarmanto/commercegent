import { StatusCodes } from 'http-status-codes'
import { MyProfileService } from './MyProfile.service'
import { UserModel } from '../models/UserModel'
import { hashPassword } from '../utilities/scurePassword'

jest.mock('../models/UserModel', () => ({ UserModel: { findOne: jest.fn(), update: jest.fn() } }))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindOne = UserModel.findOne as jest.Mock
const mockedUpdate = UserModel.update as jest.Mock

describe('MyProfileService.findMyProfile', () => {
  it('returns the profile when found', async () => {
    mockedFindOne.mockResolvedValue({ userId: 1, userName: 'Jane' })

    const result = await MyProfileService.findMyProfile(1)
    expect(result).toEqual({ userId: 1, userName: 'Jane' })
  })

  it('throws a 404 AppError when the user does not exist', async () => {
    mockedFindOne.mockResolvedValue(null)

    await expect(MyProfileService.findMyProfile(1)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND
    })
  })
})

describe('MyProfileService.updateMyProfile', () => {
  it('hashes the password when updating it', async () => {
    mockedUpdate.mockResolvedValue([1])

    await MyProfileService.updateMyProfile(1, { userPassword: 'newpass123' } as any)

    expect(mockedUpdate).toHaveBeenCalledWith(
      { userPassword: hashPassword('newpass123') },
      expect.objectContaining({ where: expect.anything() })
    )
  })

  it('throws a 400 AppError when there are no fields to update', async () => {
    await expect(MyProfileService.updateMyProfile(1, {} as any)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST
    })
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('throws a 404 AppError when no row matched the update', async () => {
    mockedUpdate.mockResolvedValue([0])

    await expect(
      MyProfileService.updateMyProfile(1, { userName: 'New Name' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})
