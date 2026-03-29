import { BiteShipService } from './biteShipService'
import { OrdersModel } from '../models/orders'
import { OrderItemsModel } from '../models/orderItems'
import { ProductModel } from '../models/products'
import { AddressesModel } from '../models/address'
import { sequelize } from '../models'
import logger from '../logs'

interface CreateDraftParams {
  orderId: number
}

export class ShippingService {
  static async createDraftFromOrder(params: CreateDraftParams) {
    const { orderId } = params

    /* ===================== 1. FETCH ORDER + ITEMS ===================== */
    const order = await OrdersModel.findByPk(orderId)
    if (!order) throw new Error('ORDER_NOT_FOUND')

    if (order.orderStatus !== 'process') {
      throw new Error('INVALID_ORDER_STATUS')
    }

    if (order.orderDraftId) {
      throw new Error('DRAFT_ALREADY_EXISTS')
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

    if (!destination) throw new Error('DESTINATION_NOT_FOUND')
    if (!origin) throw new Error('ORIGIN_NOT_FOUND')
    if (!orderItems.length) throw new Error('ORDER_ITEMS_EMPTY')

    /* ===================== 2. BUILD ITEMS ===================== */

    const items = orderItems.map((item: any) => ({
      name: item.productNameSnapshot,
      description: item.product?.productDescription ?? '',
      value: Number(item.productPriceSnapshot),
      quantity: item.quantity,
      weight: Math.max(item.product?.productWeight ?? 1, 1)
    }))

    const payload = {
      reference_id: order.orderReferenceId,

      shipper_contact_name: origin.addressUserName,
      shipper_contact_phone: origin.addressKontak,
      shipper_organization: 'LEORA ECOMMERCE',

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
      const { data } = await BiteShipService.post('/draft_orders', payload)
      draftResponse = data
    } catch (err: any) {
      logger.error('[BITESHIP_ERROR]', err?.response?.data || err)
      throw new Error('BITESHIP_FAILED')
    }

    /* ===================== 5. SAVE DRAFT ID (DB TX) ===================== */
    await sequelize.transaction(async (tx) => {
      await order.update(
        { orderDraftId: draftResponse.id, orderStatus: 'draft' },
        { transaction: tx }
      )
    })

    return {
      draftOrderId: draftResponse.id,
      biteshipResponse: draftResponse
    }
  }
}
