import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleServerError } from '../../utilities/requestHandler'
import { RegionService } from '../../services/regionService'

export const findVillages = async (req: Request, res: Response) => {
  try {
    const { districtId } = req.params

    const villages = await RegionService.getVillages(districtId)

    const response = ResponseData.default
    response.data = villages

    return res.status(StatusCodes.OK).json(response)
  } catch (error) {
    return handleServerError(res, error)
  }
}
