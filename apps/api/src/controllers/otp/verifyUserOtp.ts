import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IVerifyOtp } from '../../schemas/UserSchema'
import { OtpService } from '../../services/Otp.service'

export const verifyOtp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as IVerifyOtp
    await OtpService.verifyOtp(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'User OTP verified successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
