import { IAddress } from "./Address";
import { IProduct } from "./Product";
import { IUser } from "./User";

export interface IOrder {
  orderId: number;
  orderUserId: string;

  orderSubtotal: number;
  orderShippingFee: number;
  orderGrandTotal: number;
  orderTotalItem: number;

  orderCourierCode?: string;
  orderCourierService?: string;
  orderTrackingId?: string;
  orderWaybillId?: string;
  orderDraftId?: string;
  orderPaymentUrl?: string;
  orderPaymentToken?: string;
  orderReferenceId?: string;

  orderStatus: "waiting" | "process" | "draft" | "delivery" | "done" | "cancel";

  user: IUser;
  orderItems: IOrderItems[];
}

export interface IOrderItems {
  orderItemId: number;
  orderItemOrderId: number;
  orderItemProductId: number;
  orderItemProductVariantId: number;
  orderItemProductName: string;
  orderItemProductPrice: string;
  orderItemProductDiscount: string;
  orderItemProductSellPrice: string;
  orderItemProductImage: string;
  orderItemProductWeight: number;
  orderItemQuantity: number;
  orderItemTotalPrice: string;
  product?: IProduct;
}

export interface IOrderDetail {
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  deleted: boolean;

  orderId: number;
  orderUserId: string;

  orderSubtotal: string;
  orderShippingFee: string;
  orderGrandTotal: string;
  orderTotalItem: number;

  orderCourierCompany: string;
  orderCourierType: string;

  orderTrackingId: string | null;
  orderWaybillId: string | null;
  orderDraftId: string | null;
  orderPaymentUrl: string | null;
  orderPaymentToken: string | null;
  orderReferenceId: string | null;
  orderShippingProvider: "FRESH" | "BITESHIP";

  orderStatus: "waiting" | "process" | "draft" | "delivery" | "done" | "cancel";

  user: IUser;
  address: IAddress;
  orderItems: IOrderItems[];
}
