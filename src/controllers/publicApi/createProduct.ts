import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'
import { ResponseData } from '../../utilities/response'
import { ProductAttributes, ProductModel } from '../../models/products'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared'
import { calculateSellPrice } from '../../utilities/priceCalculator'
import { createProductPublicSchema } from '../../schemas/publicApiSchema'
import { ICreateProductPublicRequest } from '../../interfaces/productPublic'

export const createProductPublic = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error: validationError, value: validatedData } = validateRequest(
    createProductPublicSchema,
    req.body
  ) as {
    error: any
    value: ICreateProductPublicRequest
  }

  if (validationError) return handleValidationError(res, validationError)

  try {
    /* ===============================
     * DUPLICATE CODE / BARCODE CHECK
     * =============================== */
    if (validatedData.code || validatedData.barcode) {
      const orConditions: any[] = []

      if (validatedData.code) {
        orConditions.push({ productCode: validatedData.code })
      }

      if (validatedData.barcode) {
        orConditions.push({ productBarcode: validatedData.barcode })
      }

      const duplicateProduct = await ProductModel.findOne({
        where: {
          deleted: 0,
          [Op.or]: orConditions
        }
      })

      if (duplicateProduct) {
        let message = 'Product sudah terdaftar'

        if (
          validatedData.code &&
          validatedData.barcode &&
          duplicateProduct.productCode === validatedData.code &&
          duplicateProduct.productBarcode === validatedData.barcode
        ) {
          message = 'Product code dan barcode sudah terdaftar'
        } else if (
          validatedData.code &&
          duplicateProduct.productCode === validatedData.code
        ) {
          message = 'Product code sudah terdaftar'
        } else if (
          validatedData.barcode &&
          duplicateProduct.productBarcode === validatedData.barcode
        ) {
          message = 'Product barcode sudah terdaftar'
        }

        return res.status(StatusCodes.BAD_REQUEST).json(ResponseData.error({ message }))
      }
    }

    /* ===============================
     * CREATE PRODUCT
     * =============================== */
    const productSellPrice = calculateSellPrice({
      originalPrice: validatedData.price,
      discountPercent: 0
    })

    const productPayload: ProductAttributes | any = {
      productName: validatedData.name,
      productDescription: '',
      productImages: [],
      productPrice: validatedData.price,
      productDiscount: 0,
      productStock: validatedData.stock,
      productWeight: validatedData.weight,
      productIsHighlight: false,
      productSellPrice: productSellPrice,

      productIsVisible: validatedData.isVisible,
      productCode: validatedData.code,
      productBarcode: validatedData.barcode,
      productUnit: validatedData.unit
    }

    await ProductModel.create(productPayload)

    const response = ResponseData.default
    response.data = { message: 'success' }

    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
