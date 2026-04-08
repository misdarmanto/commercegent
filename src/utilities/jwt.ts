import jwt from 'jsonwebtoken'
import { appConfigs } from '../configs/appConfig'
import { IJwtPayload } from '../interfaces/shared'

export const generateAccessToken = (user: IJwtPayload): string => {
  return jwt.sign(user, appConfigs.secret.token ?? '')
}

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, appConfigs.secret.token ?? '')
  } catch {
    return false
  }
}
