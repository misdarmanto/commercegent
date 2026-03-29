import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleServerError } from '../../utilities/requestHandler'
import { RegionService } from '../../services/regionService'

export const findDistricts = async (req: Request, res: Response) => {
  try {
    const { regencyId } = req.params

    const districts = await RegionService.getDistricts(regencyId)

    const response = ResponseData.default
    response.data = districts

    return res.status(StatusCodes.OK).json(response)
  } catch (error) {
    return handleServerError(res, error)
  }
}