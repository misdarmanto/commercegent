import { IProductVariant } from "./Product";

export interface ICartProduct {
  productId: number;
  productName: string;
  productCode: string;
  productBarcode: string | null;
  productUnit: string | null;
}

export interface ICartItem {
  cartId: number;
  cartUserId: number;
  cartProductId: number;
  cartQuantity: number;
  product: ICartProduct;
  variant: IProductVariant;
}

export interface ICreateCartPayload {
  cartProductId: number;
  cartProductVariantId: number;
  cartQuantity: number;
}

export interface IUpdateCartPayload {
  cartId: number;
  cartQuantity: number;
}
