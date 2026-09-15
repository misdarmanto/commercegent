import midtransClient from 'midtrans-client'
import { appConfigs } from '../../configs/appConfig'
import { AppError } from '../../utilities/appError'
import { StatusCodes } from 'http-status-codes'
import logger from '../../utilities/logger'

export class MidtransAPIService {
  private static MidtransSnap() {
    return new midtransClient.Snap({
      isProduction: appConfigs.midtrans.isProduction,
      serverKey: appConfigs.midtrans.serverKey!,
      clientKey: appConfigs.midtrans.clientKey!
    })
  }

  static async createTransaction(payload: any) {
    try {
      return await this.MidtransSnap().createTransaction(payload)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[MidtransAPIService] createTransaction failed: ${String(error)}`)
      throw new AppError(
        'Failed to create transaction',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
