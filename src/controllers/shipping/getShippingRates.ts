import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { ProductModel } from '../../models/products'
import { AddressesModel } from '../../models/address'
import { handleServerError } from '../../utilities/requestHandler'
import { BiteShipService } from '../../services/biteShipService'
import { type IAuthenticatedRequest } from '../../interfaces/shared'

interface ShippingItemPayload {
  productId: number
  quantity: number
}

export const getShippingRates = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    /* ======================
     * 1. VALIDATE BODY
     * ====================== */
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ResponseData.error('Request body must be a non-empty array'))
    }

    const payloadItems = req.body as ShippingItemPayload[]

    for (const item of payloadItems) {
      if (!item.productId || !item.quantity) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ResponseData.error('Each item must have productId and quantity'))
      }
    }

    /* ======================
     * 2. FETCH PRODUCTS
     * ====================== */
    const productIds = payloadItems.map((item) => item.productId)

    const products = await ProductModel.findAll({
      where: {
        productId: productIds,
        deleted: 0
      }
    })

    if (products.length !== payloadItems.length) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ResponseData.error('One or more products not found'))
    }

    /* ======================
     * 3. FETCH ADDRESSES
     * ====================== */
    const originAddress = await AddressesModel.findOne({
      where: {
        addressCategory: 'admin',
        deleted: 0
      }
    })

    if (!originAddress) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ResponseData.error('Store address not found'))
    }

    const destinationAddress = await AddressesModel.findOne({
      where: {
        addressUserId: req.jwtPayload?.userId,
        addressCategory: 'user',
        deleted: 0
      }
    })

    if (!destinationAddress) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ResponseData.error('Destination address not found'))
    }

    /* ======================
     * 4. BUILD ITEMS
     * ====================== */
    const items = payloadItems.map((payloadItem) => {
      const product = products.find((p) => p.productId === payloadItem.productId)!

      return {
        name: product.productName,
        value: Number(product.productPrice),
        weight: Number(product.productWeight),
        quantity: Number(payloadItem.quantity)
      }
    })

    /* ======================
     * 5. REQUEST TO BITESHIP
     * ====================== */
    const biteshipResponse = await BiteShipService.post('/rates/couriers', {
      origin_latitude: Number(originAddress.addressLatitude),
      origin_longitude: Number(originAddress.addressLongitude),
      destination_latitude: Number(destinationAddress.addressLatitude),
      destination_longitude: Number(destinationAddress.addressLongitude),
      couriers: 'gojek,grab,paxel,jne,sicepat',
      items
    })

    const response = ResponseData.default
    response.data = biteshipResponse.data

    return res.status(StatusCodes.OK).json(response)
  } catch (error) {
    return handleServerError(res, error)
  }
}
