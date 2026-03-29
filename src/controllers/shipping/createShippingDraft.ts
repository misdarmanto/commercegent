import { Response } from 'express'
import { createDraftFromOrderSchema } from '../../schemas/orderSchema'
import { validateRequest, handleValidationError } from '../../utilities/requestHandler'
import { ShippingService } from '../../services/ShippingService'
import { IAuthenticatedRequest } from '../../interfaces/shared'

export const createShippingDraft = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error, value } = validateRequest(createDraftFromOrderSchema, req.body)

  if (error) return handleValidationError(res, error)

  try {
    const result = await ShippingService.createDraftFromOrder({
      orderId: value.orderId
    })

    return res.status(201).json({
      success: true,
      message: 'Draft order created successfully',
      data: result
    })
  } catch (err: any) {
    switch (err.message) {
      case 'ORDER_NOT_FOUND':
        return res.status(404).json({ message: 'Order not found' })

      case 'INVALID_ORDER_STATUS':
        return res.status(400).json({
          message: 'Draft can only be created when order status is PROCESS'
        })

      case 'DRAFT_ALREADY_EXISTS':
        return res.status(409).json({
          message: 'Draft order already exists'
        })

      case 'DESTINATION_NOT_FOUND':
        return res.status(400).json({ message: 'User address not found' })

      case 'ORIGIN_NOT_FOUND':
        return res.status(400).json({ message: 'Admin address not found' })

      case 'ORDER_ITEMS_EMPTY':
        return res.status(400).json({ message: 'Order items empty' })

      case 'BITESHIP_FAILED':
        return res.status(502).json({
          message: 'Failed to create draft order from shipping provider'
        })

      default:
        console.error(err)
        return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
