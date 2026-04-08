import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { OtpService } from '../../services/Otp.service'
import { type IRequestOtp } from '../../schemas/UserSchema'

export const requestOtp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as IRequestOtp
    await OtpService.requestOtp(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'User OTP requested successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
