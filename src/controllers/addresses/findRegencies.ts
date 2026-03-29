import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleServerError } from '../../utilities/requestHandler'
import { RegionService } from '../../services/regionService'

export const findRegencies = async (req: Request, res: Response) => {
  try {
    const { provinceId } = req.params

    const regencies = await RegionService.getRegencies(provinceId)

    const response = ResponseData.default
    response.data = regencies

    return res.status(StatusCodes.OK).json(response)
  } catch (error) {
    return handleServerError(res, error)
  }
}
