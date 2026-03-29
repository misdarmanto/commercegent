import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { requestChecker } from '../../utilities/requestCheker'
import { AddressesModel, type AddressesAttributes } from '../../models/address'
import { handleServerError } from '../../utilities/requestHandler'

export const removeAddress = async (req: any, res: Response): Promise<any> => {
  const requestQuery = req.query as AddressesAttributes

  const emptyField = requestChecker({
    requireList: ['addressId'],
    requestData: requestQuery
  })

  if (emptyField.length > 0) {
    const message = `invalid request parameter! require (${emptyField})`
    const response = ResponseData.error(message)
    return res.status(StatusCodes.BAD_REQUEST).json(response)
  }

  try {
    const result = await AddressesModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        addressId: { [Op.eq]: requestQuery.addressId }
      }
    })

    if (result == null) {
      const message = 'address not found!'
      const response = ResponseData.error(message)
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    result.deleted = 1
    void result.save()

    const response = ResponseData.default
    response.data = { message: 'success' }
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
