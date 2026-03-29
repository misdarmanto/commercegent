import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { AddressesModel } from '../../models/address'
import { handleServerError } from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared'

export const findUserAddress = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const result = await AddressesModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        addressUserId: { [Op.eq]: req.jwtPayload?.userId },
        addressCategory: 'user'
      }
    })

    const response = ResponseData.default
    response.data = result
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
