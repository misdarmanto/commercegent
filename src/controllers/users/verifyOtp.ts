import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import redis from '../../configs/redis'
import { verifyOtpSchema } from '../../schemas/UserSchema'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'

export const verifyOtp = async (req: any, res: Response): Promise<Response> => {
  const { error } = validateRequest(verifyOtpSchema, req.body)

  if (error != null) {
    return handleValidationError(res, error)
  }
  try {
    const storedOtp = await redis.get(`otp:${req.body.otpCode}`)
    if (!storedOtp || storedOtp !== req.body.otpCode) {
      const message = 'Invalid or expired OTP!'
      return res.status(StatusCodes.UNAUTHORIZED).json(ResponseData.error(message))
    }

    await redis.del(`otp:${req.body.otpCode}`)
    const response = ResponseData.default

    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
