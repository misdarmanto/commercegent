import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { ProductAttributes, ProductModel } from '../../models/products'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared'
import { updateProductPublicSchema } from '../../schemas/publicApiSchema'
import { IUpdateProductPublicRequest } from '../../interfaces/productPublic'

export const updateProductPublic = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error, value: validatedData } = validateRequest(
    updateProductPublicSchema,
    req.body
  ) as {
    error: any
    value: IUpdateProductPublicRequest
  }

  if (error) return handleValidationError(res, error)

  try {
    const product = await ProductModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        productCode: validatedData.code
      }
    })

    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          ResponseData.error(`Product with code (${validatedData.code}) is not found`)
        )
    }
    const productPayload: Record<string, any> = {}

    if (validatedData.name !== undefined) {
      productPayload.productName = validatedData.name
    }

    if (validatedData.price !== undefined) {
      productPayload.productPrice = validatedData.price
    }

    if (validatedData.stock !== undefined) {
      productPayload.productStock = validatedData.stock
    }

    if (validatedData.weight !== undefined) {
      productPayload.productWeight = validatedData.weight
    }

    if (validatedData.barcode !== undefined) {
      productPayload.productBarcode = validatedData.barcode
    }

    if (validatedData.unit !== undefined) {
      productPayload.productUnit = validatedData.unit
    }

    if (validatedData.isVisible !== undefined) {
      productPayload.productIsVisible = validatedData.isVisible
    }

    if (Object.keys(productPayload).length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ResponseData.error('No data provided to update'))
    }

    await product.update(productPayload)

    const response = ResponseData.default
    response.data = { message: 'success' }

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
