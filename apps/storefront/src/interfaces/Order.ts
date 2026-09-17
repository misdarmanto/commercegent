export type OrderStatus =
  | "waiting"
  | "process"
  | "draft"
  | "delivery"
  | "done"
  | "cancel";

export interface IOrderItem {
  orderItemId: number;
  orderItemProductName: string;
  orderItemProductImage?: string | null;
  orderItemProductSellPrice: number;
  orderItemQuantity: number;
}

export interface IOrder {
  orderId: number;
  orderReferenceId?: string;
  orderUserId: number;
  orderSubtotal: number;
  orderShippingFee: number;
  orderGrandTotal: number;
  orderTotalItem: number;
  orderShippingProvider: "FRESH" | "BITESHIP";
  orderCourierCompany: string | null;
  orderCourierType: string | null;
  orderPaymentUrl?: string | null;
  orderPaymentToken?: string | null;
  orderStatus: OrderStatus;
  orderItems?: IOrderItem[];
  createdAt?: string;
}

export interface ICreateOrderItemPayload {
  orderItemProductWeight: number;
  productId: number;
  productVariantId: number;
  quantity: number;
}

export interface ICreateOrderPayload {
  orderShippingProvider: "FRESH" | "BITESHIP";
  orderShippingFee: number;
  orderCourierCompany: string | null;
  orderCourierType: string | null;
  items: ICreateOrderItemPayload[];
}
