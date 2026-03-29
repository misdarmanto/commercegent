import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { AddressesModel, type AddressesAttributes } from '../../models/address'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { createAddressSchema } from '../../schemas/addressSchema'
import { IAuthenticatedRequest } from '../../interfaces/shared'

export const createUserAddress = async (req: IAuthenticatedRequest, res: Response) => {
  const { error, value } = validateRequest(createAddressSchema, req.body)
  if (error) return handleValidationError(res, error)

  try {
    const userId = req.jwtPayload!.userId

    const { jwtPayload: _jwt, ...addressFields } = value

    const payload = {
      ...addressFields,
      addressUserId: userId,
      addressCategory: 'user' as const,
      deleted: 0
    }

    const existing = await AddressesModel.findOne({
      where: {
        addressUserId: userId,
        addressCategory: 'user'
      }
    })

    if (existing) {
      await existing.update(payload)
      return res.status(StatusCodes.OK).json({ message: 'User address updated' })
    }

    await AddressesModel.create(payload)

    const response = ResponseData.default
    response.data = { message: 'User address created' }

    return res.status(201).json(response)
  } catch (e) {
    return handleServerError(res, e)
  }
}
