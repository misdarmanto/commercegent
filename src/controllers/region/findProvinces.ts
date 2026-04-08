import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { RegionService } from '../../services/Region.service'

export const findProvinces = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await RegionService.getProvinces()
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
