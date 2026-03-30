import { Request, Response } from 'express'
import { OrdersModel } from '../../models/orders'
import { BiteShipService } from '../../services/biteShipService'
import { trackOrderSchema } from '../../schemas/OrderSchema'
import { validateRequest, handleValidationError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'
import { StatusCodes } from 'http-status-codes'
import logger from '../../logs'

export const trackShipment = async (req: Request, res: Response) => {
  const { error, value } = validateRequest(trackOrderSchema, req.query)

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

    if (!order.orderWaybillId || !order.orderCourierCompany) {
      return res.status(400).json({
        success: false,
        message: 'Shipment data not available'
      })
    }

    const { data } = await BiteShipService.get(
      `/trackings/${order.orderWaybillId}/couriers/${order.orderCourierCompany}`
    )

    /* ===================== 3. RESPONSE ===================== */
    const response = ResponseData.default
    response.data = data

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    logger.error('[BITESHIP_TRACKING_ERROR]', serverError)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
