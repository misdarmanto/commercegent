import axios from 'axios'
import { StatusCodes } from 'http-status-codes'
import { appConfigs } from '../../configs/appConfig'
import { AppError } from '../../utilities/appError'
import logger from '../../utilities/logger'

export class WablasAPIService {
  static async sendMessage(payload: { phone: string; message: string }) {
    try {
      const response = await axios.get(`${appConfigs.wablas.url}/send-message`, {
        params: {
          phone: payload.phone,
          message: payload.message,
          token: appConfigs.wablas.apiKey
        }
      })

      if (response.status !== 200) {
        throw new AppError('Failed to send WhatsApp message', StatusCodes.BAD_GATEWAY)
      }

      return response.data
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[WablasApiService] sendMessage failed: ${String(serviceError)}`)
      throw new AppError('Failed to send WhatsApp message', StatusCodes.BAD_GATEWAY)
    }
  }
}
