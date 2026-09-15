import { StatusCodes } from 'http-status-codes'
import { RegionService } from './Region.service'
import { RegionAPIService } from './external/RegionApi.service'
import { AppError } from '../utilities/appError'

jest.mock('./external/RegionApi.service', () => ({
  RegionAPIService: {
    getProvinces: jest.fn(),
    getRegencies: jest.fn(),
    getDistricts: jest.fn(),
    getVillages: jest.fn()
  }
}))

jest.mock('../utilities/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }))

describe('RegionService', () => {
  it('getProvinces returns the data from RegionAPIService', async () => {
    ;(RegionAPIService.getProvinces as jest.Mock).mockResolvedValue([{ id: '1', name: 'Aceh' }])

    const result = await RegionService.getProvinces()
    expect(result).toEqual([{ id: '1', name: 'Aceh' }])
  })

  it('getRegencies forwards the provinceId to RegionAPIService', async () => {
    ;(RegionAPIService.getRegencies as jest.Mock).mockResolvedValue([])

    await RegionService.getRegencies('11')
    expect(RegionAPIService.getRegencies).toHaveBeenCalledWith('11')
  })

  it('getDistricts wraps a failure into a 500 AppError', async () => {
    ;(RegionAPIService.getDistricts as jest.Mock).mockRejectedValue(new Error('timeout'))

    await expect(RegionService.getDistricts('1101')).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to get districts'
    })
  })

  it('getVillages rethrows an existing AppError untouched', async () => {
    const notFound = AppError.notFound('Village not found')
    ;(RegionAPIService.getVillages as jest.Mock).mockRejectedValue(notFound)

    await expect(RegionService.getVillages('110101')).rejects.toBe(notFound)
  })
})
