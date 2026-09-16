import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AddressService } from './Address.service'
import { AddressesModel } from '../models/AddressModel'
import { sequelizeInit } from '../configs/database'

jest.mock('../models/AddressModel', () => ({
  AddressesModel: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))
jest.mock('../configs/database', () => ({
  sequelizeInit: {
    transaction: jest.fn(async (cb: any) => await cb({}))
  }
}))
jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

const mockedFindAll = AddressesModel.findAll as jest.Mock
const mockedFindOne = AddressesModel.findOne as jest.Mock
const mockedCount = AddressesModel.count as jest.Mock
const mockedCreate = AddressesModel.create as jest.Mock
const mockedUpdate = AddressesModel.update as jest.Mock

describe('AddressService.createUserAddress', () => {
  it('marks the first address as main', async () => {
    mockedCount.mockResolvedValue(0)

    await AddressService.createUserAddress(1, { addressUserName: 'Home' } as any)

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ addressType: 'main', addressCategory: 'user' })
    )
  })

  it('marks subsequent addresses as secondary', async () => {
    mockedCount.mockResolvedValue(1)

    await AddressService.createUserAddress(1, { addressUserName: 'Office' } as any)

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ addressType: 'secondary' })
    )
  })

  it('rejects creating more than 5 addresses', async () => {
    mockedCount.mockResolvedValue(6)

    await expect(
      AddressService.createUserAddress(1, { addressUserName: 'Extra' } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
    expect(mockedCreate).not.toHaveBeenCalled()
  })
})

describe('AddressService.createAdminAddress', () => {
  it('updates the existing admin address instead of creating a new one', async () => {
    mockedUpdate.mockResolvedValue([1])

    await AddressService.createAdminAddress(1, { addressUserName: 'HQ' } as any)

    expect(mockedUpdate).toHaveBeenCalled()
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('creates the admin address when none exists yet', async () => {
    mockedUpdate.mockResolvedValue([0])

    await AddressService.createAdminAddress(1, { addressUserName: 'HQ' } as any)

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ addressCategory: 'admin' })
    )
  })
})

describe('AddressService.updateAddress', () => {
  it('throws a 404 AppError when no row matched', async () => {
    mockedUpdate.mockResolvedValue([0])
    await expect(
      AddressService.updateAddress(1, { addressId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})

describe('AddressService.updateAddressTypeToMain', () => {
  it('throws a 404 AppError when the target address does not exist', async () => {
    mockedFindOne.mockResolvedValue(null)

    await expect(
      AddressService.updateAddressTypeToMain(1, { addressId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('demotes the current main address and promotes the target one', async () => {
    mockedFindOne.mockResolvedValue({ addressId: 1 })
    mockedUpdate.mockResolvedValue([1])

    await AddressService.updateAddressTypeToMain(1, { addressId: 1 } as any)

    expect(mockedUpdate).toHaveBeenNthCalledWith(
      1,
      { addressType: 'secondary' },
      expect.objectContaining({ where: expect.objectContaining({ addressType: { [Op.eq]: 'main' } }) })
    )
    expect(mockedUpdate).toHaveBeenNthCalledWith(
      2,
      { addressType: 'main' },
      expect.objectContaining({ where: expect.objectContaining({ addressId: { [Op.eq]: 1 } }) })
    )
  })
})

describe('AddressService.removeAddress', () => {
  it('resolves when a row was updated', async () => {
    mockedUpdate.mockResolvedValue([1])
    await expect(
      AddressService.removeAddress(1, { addressId: 1 } as any)
    ).resolves.toBeUndefined()
  })

  it('throws a 404 AppError when no row matched', async () => {
    mockedUpdate.mockResolvedValue([0])
    await expect(
      AddressService.removeAddress(1, { addressId: 1 } as any)
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })
})

describe('AddressService.findUserAddress / findAdminAddress', () => {
  it('findUserAddress returns the list from the model', async () => {
    mockedFindAll.mockResolvedValue([{ addressId: 1 }])
    expect(await AddressService.findUserAddress(1, {} as any)).toEqual([{ addressId: 1 }])
  })

  it('findAdminAddress wraps an unexpected error', async () => {
    mockedFindOne.mockRejectedValue(new Error('db down'))
    await expect(AddressService.findAdminAddress()).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    })
  })
})
