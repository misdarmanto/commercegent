import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared'
import { BannerService } from '../../services/Banner.service'
import { IFindAllBanners } from '../../schemas/BannerSchema'

export const findAllBanners = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllBanners
    const result = await BannerService.findAllBanners(payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
