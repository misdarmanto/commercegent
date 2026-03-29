import { type Request, type Response } from 'express'
import { OrdersModel } from '../../models/orders'
import { ResponseData } from '../../utilities/response'
import { StatusCodes } from 'http-status-codes'
import logger from '../../logs'

interface Ipayload {
  event: string
  order_id: string
  order_price: number
  courier_tracking_id: string
  courier_waybill_id: string
  courier_company: string
  courier_type: string
  status: string
}

export const bitshipWebhookHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  const payload = req.body as Ipayload

  try {
    if (payload && payload.courier_waybill_id) {
      const order = await OrdersModel.findOne({
        where: {
          deleted: 0,
          orderWaybillId: payload?.courier_waybill_id
        }
      })

      if (order) {
        if (payload.status === 'delivered') {
          order.orderStatus = 'done'
          order.save()
        }
      }
    } else {
      logger.warn('[BITESHIP WEBHOOK] - payload is empty')
    }

    return res.status(StatusCodes.OK).json(ResponseData.default)
  } catch (error) {
    logger.error('Bitship Webhook Error:', error)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ResponseData.error('Webhook processing failed'))
  }
}
