import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { ProductModel } from '../../models/products'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { calculateSellPrice } from '../../utilities/priceCalculator'
import { createProductSchema } from '../../schemas/productSchema'
import { Op } from 'sequelize'

export const createProduct = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error: validationError, value: validatedData } = validateRequest(
    createProductSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    /**
     * ===============================
     * CHECK DUPLICATE CODE / BARCODE
     * ===============================
     */
    const existingProduct = await ProductModel.findOne({
      where: {
        deleted: 0,
        [Op.or]: [
          { productCode: validatedData.productCode },
          { productBarcode: validatedData.productBarcode }
        ]
      }
    })

    if (existingProduct) {
      let message = 'Product sudah terdaftar'

      if (
        existingProduct.productCode === validatedData.productCode &&
        existingProduct.productBarcode === validatedData.productBarcode
      ) {
        message = 'Product code dan barcode sudah terdaftar'
      } else if (existingProduct.productCode === validatedData.productCode) {
        message = 'Product code sudah terdaftar'
      } else if (existingProduct.productBarcode === validatedData.productBarcode) {
        message = 'Product barcode sudah terdaftar'
      }

      return res.status(StatusCodes.BAD_REQUEST).json(ResponseData.error({ message }))
    }

    /**
     * ===============================
     * CALCULATE SELL PRICE
     * ===============================
     */
    const productSellPrice = calculateSellPrice({
      originalPrice: Number(validatedData.productPrice),
      discountPercent: Number(validatedData.productDiscount)
    })

    await ProductModel.create({
      ...validatedData,
      productSellPrice,
      deleted: 0,
      productIsHighlight: false,
      productDescription: validatedData.productDescription ?? '',
      productCategoryId: String(validatedData.productCategoryId),
      productSubCategoryId: String(validatedData.productSubCategoryId),
      productBarcode: validatedData.productBarcode ?? '',
      productIsVisible: validatedData.productIsVisible ?? false
    })

    const response = ResponseData.default
    response.data = { message: 'success' }

    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
