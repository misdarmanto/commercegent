import { StatusCodes } from 'http-status-codes'
import { AdminService } from './Admin.service'
import { UserModel } from '../models/UserModel'
import { hashPassword } from '../utilities/scurePassword'

jest.mock('../models/UserModel', () => ({
  UserModel: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAndCountAll = UserModel.findAndCountAll as jest.Mock
const mockedFindOne = UserModel.findOne as jest.Mock
const mockedCreate = UserModel.create as jest.Mock
const mockedUpdate = UserModel.update as jest.Mock

describe('AdminService.findAllAdmins', () => {
  it('formats the paginated result', async () => {
    mockedFindAndCountAll.mockResolvedValue({ count: 1, rows: [{ userId: 2 }] })
    const result = await AdminService.findAllAdmins(1, { page: 1, size: 10 } as any)
    expect(result.items).toEqual([{ userId: 2 }])
  })
})

describe('AdminService.findDetailAdmin', () => {
  it('throws a 403 AppError when not found', async () => {
    mockedFindOne.mockResolvedValue(null)
    await expect(AdminService.findDetailAdmin({ adminId: 1 } as any)).rejects.toMatchObject({
      statusCode: StatusCodes.FORBIDDEN
    })
  })
})

describe('AdminService.createAdmin', () => {
  const payload = {
    adminName: 'Admin',
    adminPassword: 'secret123',
    adminWhatsAppNumber: '628123456789',
    adminRole: 'admin'
  }

  it('rejects a duplicate whatsapp number', async () => {
    mockedFindOne.mockResolvedValue({ userId: 1 })

    await expect(AdminService.createAdmin(payload as any)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST
    })
  })

  it('creates the admin with a hashed password', async () => {
    mockedFindOne.mockResolvedValue(null)

    await AdminService.createAdmin(payload as any)

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userName: 'Admin',
        userPassword: hashPassword('secret123'),
        userRole: 'admin'
      })
    )
  })
})

describe('AdminService.updateAdmin', () => {
  it('throws a 400 AppError when there are no fields to update', async () => {
    await expect(AdminService.updateAdmin(1, {} as any)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST
    })
  })

  it('rejects a duplicate admin name', async () => {
    mockedFindOne.mockResolvedValue({ userId: 2 })

    await expect(
      AdminService.updateAdmin(1, { adminName: 'Taken' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('throws a 404 AppError when no row matched', async () => {
    mockedFindOne.mockResolvedValue(null)
    mockedUpdate.mockResolvedValue([0])

    await expect(
      AdminService.updateAdmin(1, { adminName: 'New Name' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})
