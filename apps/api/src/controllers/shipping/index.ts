import { getShippingRates } from './getShippingRates'
import { createShippingDraft } from './createShippingDraft'
import { confirmDraftOrder } from './confirmDraftOrder'
import { trackShipment } from './trackShipping'

export const ShippingController = {
  getShippingRates,
  createShippingDraft,
  confirmDraftOrder,
  trackShipment
}
