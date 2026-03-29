import midtransClient from 'midtrans-client'
import { appConfigs } from './appConfig'

export const MidtransSnap = new midtransClient.Snap({
  isProduction: appConfigs.midtrans.isProduction,
  serverKey: appConfigs.midtrans.serverKey!,
  clientKey: appConfigs.midtrans.clientKey!
})
