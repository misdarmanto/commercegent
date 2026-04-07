import axios from 'axios'

const REGION_BASE_URL =
  'https://www.emsifa.com/api-wilayah-indonesia/api'

export class RegionService {
  static async getProvinces() {
    const response = await axios.get(
      `${REGION_BASE_URL}/provinces.json`
    )
    return response.data
  }

  static async getRegencies(provinceId: string) {
    const response = await axios.get(
      `${REGION_BASE_URL}/regencies/${provinceId}.json`
    )
    return response.data
  }

  static async getDistricts(regencyId: string) {
    const response = await axios.get(
      `${REGION_BASE_URL}/districts/${regencyId}.json`
    )
    return response.data
  }

  static async getVillages(districtId: string) {
    const response = await axios.get(
      `${REGION_BASE_URL}/villages/${districtId}.json`
    )
    return response.data
  }
}
