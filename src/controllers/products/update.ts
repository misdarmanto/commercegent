import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { Op } from 'sequelize'
import { ProductModel } from '../../models/products'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared'
import { updateProductSchema } from '../../schemas/productSchema'
import { calculateSellPrice } from '../../utilities/priceCalculator'

export const updateProduct = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error, value: validatedData } = validateRequest(updateProductSchema, req.body)

  if (error) return handleValidationError(res, error)

  try {
    /**
     * ===============================
     * FIND CURRENT PRODUCT
     * ===============================
     */
    const product = await ProductModel.findOne({
      where: {
        deleted: 0,
        productId: validatedData.productId
      }
    })

    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ResponseData.error('Product not found'))
    }

    /**
     * ===============================
     * CHECK DUPLICATE CODE / BARCODE
     * ===============================
     */
    if (validatedData.productCode || validatedData.productBarcode) {
      const orConditions: any[] = []

      if (validatedData.productCode) {
        orConditions.push({ productCode: validatedData.productCode })
      }

      if (validatedData.productBarcode) {
        orConditions.push({ productBarcode: validatedData.productBarcode })
      }

      const duplicateProduct = await ProductModel.findOne({
        where: {
          deleted: 0,
          productId: { [Op.ne]: validatedData.productId }, // exclude current product
          [Op.or]: orConditions
        }
      })

      if (duplicateProduct) {
        let message = 'Product sudah terdaftar'

        if (
          validatedData.productCode &&
          validatedData.productBarcode &&
          duplicateProduct.productCode === validatedData.productCode &&
          duplicateProduct.productBarcode === validatedData.productBarcode
        ) {
          message = 'Product code dan barcode sudah terdaftar'
        } else if (
          validatedData.productCode &&
          duplicateProduct.productCode === validatedData.productCode
        ) {
          message = 'Product code sudah terdaftar'
        } else if (
          validatedData.productBarcode &&
          duplicateProduct.productBarcode === validatedData.productBarcode
        ) {
          message = 'Product barcode sudah terdaftar'
        }

        return res.status(StatusCodes.BAD_REQUEST).json(ResponseData.error({ message }))
      }
    }

    /**
     * ===============================
     * RECALCULATE SELL PRICE (OPTIONAL)
     * ===============================
     */
    const updatedPrice = validatedData.productPrice ?? product.productPrice

    const updatedDiscount = validatedData.productDiscount ?? product.productDiscount

    if (
      validatedData.productPrice !== undefined ||
      validatedData.productDiscount !== undefined
    ) {
      validatedData.productSellPrice = calculateSellPrice({
        originalPrice: Number(updatedPrice),
        discountPercent: Number(updatedDiscount)
      })
    }

    /**
     * ===============================
     * UPDATE PRODUCT
     * ===============================
     */
    const { productCategoryId, productSubCategoryId, ...restUpdate } = validatedData

    await product.update({
      ...restUpdate,
      ...(productCategoryId !== undefined && {
        productCategoryId: String(productCategoryId)
      }),
      ...(productSubCategoryId !== undefined && {
        productSubCategoryId: String(productSubCategoryId)
      })
    })

    const response = ResponseData.default
    response.data = { message: 'success' }

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
