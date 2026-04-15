import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared'
import { BannerService } from '../../services/Banner.service'
import { ICreateBanner } from '../../schemas/BannerSchema'

export const createBanner = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateBanner
    await BannerService.createBanner(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Banner created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
