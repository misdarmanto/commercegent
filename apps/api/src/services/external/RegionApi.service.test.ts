import axios from 'axios'
import { RegionAPIService } from './RegionApi.service'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('RegionAPIService', () => {
  it('getProvinces calls the provinces endpoint and returns the data', async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ id: '1', name: 'Aceh' }] })

    const result = await RegionAPIService.getProvinces()

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/provinces.json')
    )
    expect(result).toEqual([{ id: '1', name: 'Aceh' }])
  })

  it('getRegencies includes the provinceId in the url', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] })

    await RegionAPIService.getRegencies('11')

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/regencies/11.json'))
  })

  it('getDistricts includes the regencyId in the url', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] })

    await RegionAPIService.getDistricts('1101')

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/districts/1101.json'))
  })

  it('getVillages includes the districtId in the url', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] })

    await RegionAPIService.getVillages('110101')

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/villages/110101.json'))
  })
})
