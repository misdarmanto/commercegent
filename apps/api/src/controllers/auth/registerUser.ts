import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AuthService } from '../../services/Auth.service'
import { type ISignupUser } from '../../schemas/UserSchema'

export const registerUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const payload = req.body as unknown as ISignupUser
    await AuthService.userSignup(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'User registered successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
