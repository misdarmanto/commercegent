import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleServerError } from '../../utilities/requestHandler'
import { RegionService } from '../../services/regionService'

export const findProvinces = async (req: Request, res: Response) => {
  try {
    const provinces = await RegionService.getProvinces()

    const response = ResponseData.default
    response.data = provinces

    return res.status(StatusCodes.OK).json(response)
  } catch (error) {
    return handleServerError(res, error)
  }
}

