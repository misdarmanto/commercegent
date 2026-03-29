import { type Request } from 'express'

export interface IJwtPayload {
  userId: number
  userRole: 'user' | 'admin' | 'superAdmin'
}

export interface IAuthenticatedRequest extends Request {
  jwtPayload?: IJwtPayload
}
