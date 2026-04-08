import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { OtpController } from '../controllers/otp'
import { requestOtpSchema, verifyOtpSchema } from '../schemas/UserSchema'

const OtpRoute = Router()

OtpRoute.post(
  '/request',
  MiddleWares.validate({ body: requestOtpSchema }),
  OtpController.requestOtp
)

OtpRoute.post(
  '/verify',
  MiddleWares.validate({ body: verifyOtpSchema }),
  OtpController.verifyOtp
)

export default OtpRoute
