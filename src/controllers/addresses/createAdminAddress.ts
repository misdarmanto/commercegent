import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { AddressesModel } from '../../models/address'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { createAddressSchema } from '../../schemas/addressSchema'
import { IAuthenticatedRequest } from '../../interfaces/shared'

export const createAdminAddress = async (req: IAuthenticatedRequest, res: Response) => {
  if (!['admin', 'superAdmin'].includes(req.jwtPayload!.userRole)) {
    return res.status(403).json(ResponseData.error('Forbidden'))
  }

  const { error, value } = validateRequest(createAddressSchema, req.body)
  if (error) return handleValidationError(res, error)

  try {
    const existing = await AddressesModel.findOne({
      where: { addressCategory: 'admin' }
    })

    const { jwtPayload: _jwt, ...addressFields } = value

    const payload = {
      ...addressFields,
      addressUserId: req.jwtPayload!.userId,
      addressCategory: 'admin' as const,
      deleted: 0
    }

    if (existing) {
      await existing.update(payload)
      return res.status(StatusCodes.OK).json({ message: "'Admin address updated" })
    }

    await AddressesModel.create(payload)

    const response = ResponseData.default
    response.data = { message: 'Admin address created' }

    return res.status(201).json(response)
  } catch (e) {
    return handleServerError(res, e)
  }
}
