import { BiteShipAPIService } from './external/BiteShipApi.service'
import { OrdersModel } from '../models/OrderModel'
import { OrderItemsModel } from '../models/OrderItemModel'
import { ProductModel } from '../models/ProductModel'
import { AddressesModel } from '../models/AddressModel'
import { sequelizeInit } from '../configs/database'
import logger from '../utilities/logger'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../utilities/appError'
import { IConfirmDraftOrder } from '../schemas/OrderSchema'
import {
  ICreateShippingDraft,
  IGetShippingRates,
  ITrackShipment
} from '../schemas/ShippingSchema'
import { ProductVariantModel } from '../models/ProductVariantModel'
import { LocalShippingModel } from '../models/LocalShippingModel'

export class ShippingService {
  static async getShippingRates(userId: number, payload: IGetShippingRates) {
    try {
      const productVariantIds = payload.map((item) => item.productVariantId)

      const productVariants = await ProductVariantModel.findAll({
        where: {
          productVariantId: productVariantIds,
          deleted: false
        }
      })

      if (productVariants.length !== payload.length) {
        throw new AppError(
          'One or more products variant not found',
          StatusCodes.NOT_FOUND
        )
      }

      const originAddress = await AddressesModel.findOne({
        where: {
          addressCategory: 'admin',
          deleted: false
        }
      })

      if (originAddress == null) {
        throw new AppError('Store address not found', StatusCodes.NOT_FOUND)
      }

      const destinationAddress = await AddressesModel.findOne({
        where: {
          addressUserId: userId,
          addressCategory: 'user',
          addressType: 'main',
          deleted: false
        }
      })

      if (destinationAddress == null) {
        throw new AppError('Destination address not found', StatusCodes.NOT_FOUND)
      }

      const localShippings = await LocalShippingModel.findAll({
        where: {
          localShippingProvinceId: destinationAddress.addressProvinsi
        }
      })

      if (localShippings.length === 0) {
        throw new AppError('Local shipping not found', StatusCodes.NOT_FOUND)
      }

      const isLocalShipping = localShippings.find(
        (localShipping) =>
          localShipping.localShippingProvinceName === destinationAddress.addressProvinsi
      )

      if (isLocalShipping !== null) {
        // calculate shipping price
      } else {
        const biteshipItems = payload.map((payloadItem) => {
          const productVariant = productVariants.find(
            (p: any) => p.productVariantId === payloadItem.productVariantId
          )!

          return {
            name: productVariant.productVariantName,
            value: Number(productVariant.productVariantPrice),
            weight: Number(productVariant.productVariantWeight),
            quantity: Number(payloadItem.quantity)
          }
        })

        const biteshipResponse = await BiteShipAPIService.post('/rates/couriers', {
          origin_latitude: Number(originAddress.addressLatitude),
          origin_longitude: Number(originAddress.addressLongitude),
          destination_latitude: Number(destinationAddress.addressLatitude),
          destination_longitude: Number(destinationAddress.addressLongitude),
          couriers: 'gojek,grab,paxel,jne,sicepat',
          items: biteshipItems
        })

        return biteshipResponse.data
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ShippingService] getShippingRates failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to get shipping rates',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async createDraftFromOrder(payload: ICreateShippingDraft) {
    try {
      const { userId, orderId } = payload

      /* ===================== 1. FETCH ORDER + ITEMS ===================== */
      const order = await OrdersModel.findByPk(orderId)
      if (order == null) {
        throw new AppError('Order not found', StatusCodes.NOT_FOUND)
      }

      if (String(order.orderUserId) !== String(userId)) {
        throw new AppError('access denied!', StatusCodes.FORBIDDEN)
      }

      if (order.orderStatus !== 'process') {
        throw new AppError(
          'Draft can only be created when order status is PROCESS',
          StatusCodes.BAD_REQUEST
        )
      }

      if (order.orderDraftId) {
        throw new AppError('Draft order already exists', StatusCodes.CONFLICT)
      }

      const [destination, origin, orderItems] = await Promise.all([
        AddressesModel.findOne({
          where: { addressUserId: order.orderUserId, addressCategory: 'user' }
        }),
        AddressesModel.findOne({
          where: { addressCategory: 'admin' }
        }),
        OrderItemsModel.findAll({
          where: { orderId: order.orderId },
          include: [
            {
              model: ProductModel,
              attributes: ['productDescription', 'productWeight']
            }
          ]
        })
      ])

      if (!destination)
        throw new AppError('User address not found', StatusCodes.BAD_REQUEST)
      if (!origin) throw new AppError('Admin address not found', StatusCodes.BAD_REQUEST)
      if (!orderItems.length)
        throw new AppError('Order items empty', StatusCodes.BAD_REQUEST)

      /* ===================== 2. BUILD ITEMS ===================== */

      const items = orderItems.map((item: any) => ({
        name: item.productNameSnapshot,
        description: item.product?.productDescription ?? '',
        value: Number(item.productPriceSnapshot),
        quantity: item.quantity,
        weight: Math.max(item.product?.productWeight ?? 1, 1)
      }))

      const biteshipPayload = {
        reference_id: order.orderReferenceId,

        shipper_contact_name: origin.addressUserName,
        shipper_contact_phone: origin.addressKontak,
        shipper_organization: 'FRESH',

        origin_contact_name: origin.addressUserName,
        origin_contact_phone: origin.addressKontak,
        origin_address: origin.addressDetail,
        origin_postal_code: origin.addressPostalCode,
        origin_coordinate: {
          latitude: Number(origin.addressLatitude),
          longitude: Number(origin.addressLongitude)
        },

        destination_contact_name: destination.addressUserName,
        destination_contact_phone: destination.addressKontak,
        destination_address: destination.addressDetail,
        destination_postal_code: destination.addressPostalCode,
        destination_coordinate: {
          latitude: Number(destination.addressLatitude),
          longitude: Number(destination.addressLongitude)
        },

        courier_company: order.orderCourierCompany,
        courier_type: order.orderCourierType,
        delivery_type: 'now',
        shipment_category: 'parcel',

        order_note: `Order #${order.orderReferenceId}`,
        metadata: {
          orderId: order.orderReferenceId,
          userId: order.orderUserId
        },

        items
      }

      /* ===================== 4. CALL BITESHIP ===================== */

      type DraftResponse = {
        id: string
      }

      let draftResponse = {} as DraftResponse

      try {
        const { data } = await BiteShipAPIService.post('/draft_orders', biteshipPayload)
        draftResponse = data
      } catch (serviceError) {
        if (serviceError instanceof AppError) throw serviceError
        logger.error(
          `[ShippingService] createDraftFromOrder failed: ${String(serviceError)}`
        )
        throw new AppError(
          'Failed to create draft order from shipping provider',
          StatusCodes.BAD_GATEWAY
        )
      }

      /* ===================== 5. SAVE DRAFT ID (DB TX) ===================== */
      await sequelizeInit.transaction(async (tx) => {
        await order.update(
          { orderDraftId: draftResponse.id, orderStatus: 'draft' },
          { transaction: tx }
        )
      })

      return {
        draftOrderId: draftResponse.id,
        biteshipResponse: draftResponse
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[ShippingService] createDraftFromOrder failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to create draft order from shipping provider',
        StatusCodes.BAD_GATEWAY
      )
    }
  }

  static async confirmDraftOrder(userId: number, payload: IConfirmDraftOrder) {
    const { orderId } = payload
    try {
      const order = await OrdersModel.findByPk(orderId)

      if (order == null) {
        throw new AppError('Order not found', StatusCodes.NOT_FOUND)
      }

      if (order.orderUserId !== String(userId)) {
        throw new AppError('Access denied!', StatusCodes.FORBIDDEN)
      }

      if (!order.orderDraftId) {
        throw new AppError('Draft order not found', StatusCodes.BAD_REQUEST)
      }

      if (order.orderStatus !== 'draft') {
        throw new AppError('Order must be in DRAFT status', StatusCodes.BAD_REQUEST)
      }

      const { data: confirmResponse } = await BiteShipAPIService.post(
        `/draft_orders/${order.orderDraftId}/confirm`
      )

      await sequelizeInit.transaction(async (tx) => {
        await order.update(
          {
            orderStatus: 'delivery',
            orderWaybillId: confirmResponse?.courier?.waybill_id,
            orderTrackingId: confirmResponse?.courier?.tracking_id
          },
          { transaction: tx }
        )
      })

      return {
        orderId: order.orderId,
        waybillId: confirmResponse?.waybill_id,
        trackingId: confirmResponse?.tracking_id,
        courier: confirmResponse?.courier
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ShippingService] confirmDraftOrder failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to confirm draft order',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async trackShipment(userId: number, payload: ITrackShipment) {
    try {
      const order = await OrdersModel.findByPk(payload.orderId)

      if (order == null) {
        throw new AppError('Order not found', StatusCodes.NOT_FOUND)
      }

      if (order.orderUserId !== String(userId)) {
        throw new AppError('Access denied!', StatusCodes.FORBIDDEN)
      }

      if (!order.orderWaybillId || !order.orderCourierCompany) {
        throw new AppError('Shipment data not available', StatusCodes.BAD_REQUEST)
      }

      const { data } = await BiteShipAPIService.get(
        `/trackings/${order.orderWaybillId}/couriers/${order.orderCourierCompany}`
      )

      return data
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ShippingService] trackShipment failed: ${String(serviceError)}`)
      throw new AppError('Failed to track shipment', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
