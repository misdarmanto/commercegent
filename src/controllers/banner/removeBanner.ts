import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared'
import { BannerService } from '../../services/Banner.service'
import { IRemoveBanner } from '../../schemas/BannerSchema'

export const removeBanner = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IRemoveBanner
    await BannerService.removeBanner(payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Banner removed successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
