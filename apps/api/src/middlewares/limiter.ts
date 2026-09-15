import rateLimit from 'express-rate-limit'
import { appConfigs } from '../configs/appConfig'

export const limiter = () =>
  rateLimit({
    windowMs: parseInt(appConfigs.rateLimit.windowMinutes ?? '15') * 60 * 1000,
    max: parseInt(appConfigs.rateLimit.maxRequest ?? '100')
  })
