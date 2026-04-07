import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UserService } from '../../services/User.service'
import { type IRequestOtp } from '../../schemas/UserSchema'

export const requestUserOtp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as IRequestOtp
    await UserService.requestOtp(payload)
    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'User OTP requested successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
