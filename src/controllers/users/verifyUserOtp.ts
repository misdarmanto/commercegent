import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { UserService } from '../../services/User.service'
import { type IVerifyOtp } from '../../schemas/UserSchema'

export const verifyUserOtp = async (req: unknown, res: Response): Promise<Response> => {
  try {
    const body = (req as { body: IVerifyOtp }).body
    const result = await UserService.verifyOtp(body)
    return res.status(StatusCodes.CREATED).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
