import { type NextFunction, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../utilities/response'
import { verifyAccessToken } from '../utilities/jwt'
import { type IAuthenticatedRequest } from '../interfaces/shared'
import { handleError } from '../utilities/requestHandler'

export const authorization = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): any => {
  try {
    if (
      req.headers.authorization == null ||
      !req.headers.authorization.startsWith('Bearer ')
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ResponseData.error({ message: 'Missing Authorization.' }))
    }

    const token = req.headers.authorization.split(' ')[1]
    const verify = verifyAccessToken(token)

    if (!verify) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(ResponseData.error({ message: 'Invalid Authorization.' }))
    }

    req.jwtPayload = verify

    next()
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
