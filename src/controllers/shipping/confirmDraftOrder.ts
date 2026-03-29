import { Request, Response } from 'express'
import { sequelize } from '../../models'
import { OrdersModel } from '../../models/orders'
import { BiteShipService } from '../../services/biteShipService'
import { confirmDraftOrderSchema } from '../../schemas/orderSchema'
import { validateRequest, handleValidationError } from '../../utilities/requestHandler'

export const confirmDraftOrder = async (req: Request, res: Response) => {
  const { error, value } = validateRequest(confirmDraftOrderSchema, req.body)

  if (error) return handleValidationError(res, error)

  const { orderId } = value

  try {
    /* ===================== 1. GET ORDER ===================== */
    const order = await OrdersModel.findByPk(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    if (!order.orderDraftId) {
      return res.status(400).json({
        success: false,
        message: 'Draft order not found'
      })
    }

    if (order.orderStatus !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Order must be in DRAFT status'
      })
    }

    /* ===================== 2. CONFIRM DRAFT (BITESHIP) ===================== */
    let confirmResponse = {} as any

    try {
      const { data } = await BiteShipService.post(
        `/draft_orders/${order.orderDraftId}/confirm`
      )
      confirmResponse = data
    } catch (err: any) {
      console.error('[BITESHIP_CONFIRM_ERROR]', err?.response?.data || err)

      return res.status(502).json({
        success: false,
        message: 'Failed to confirm draft order'
      })
    }

    /* ===================== 3. UPDATE ORDER ===================== */
    await sequelize.transaction(async (tx) => {
      await order.update(
        {
          orderStatus: 'delivery',
          orderWaybillId: confirmResponse?.courier?.waybill_id,
          orderTrackingId: confirmResponse?.courier?.tracking_id
        },
        { transaction: tx }
      )
    })

    /* ===================== 4. RESPONSE ===================== */
    return res.status(200).json({
      success: true,
      message: 'Draft order confirmed & shipment created',
      data: {
        orderId: order.orderId,
        waybillId: confirmResponse.waybill_id,
        trackingId: confirmResponse.tracking_id,
        courier: confirmResponse.courier
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
