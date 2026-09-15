import axios from 'axios'
import { appConfigs } from '../../configs/appConfig'
import logger from '../../utilities/logger'

export const BiteShipAPIService = axios.create({
  baseURL: appConfigs.biteShip.baseURL,
  headers: {
    Authorization: `Bearer ${appConfigs.biteShip.apiKey}`,
    'Content-Type': 'application/json'
  }
})

export const getBiteShipErrorDetail = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return JSON.stringify({
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      method: error.config?.method,
      url: error.config?.url,
      responseData: error.response?.data
    })
  }

  return String(error)
}

BiteShipAPIService.interceptors.response.use(
  (response) => response,
  async (error) => {
    logger.error(`[BiteShipAPIService] request failed: ${getBiteShipErrorDetail(error)}`)
    throw error
  }
)
