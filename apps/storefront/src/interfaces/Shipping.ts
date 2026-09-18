export interface IShippingRate {
  courier_name: string;
  courier_service_name: string;
  courier_code: string;
  courier_service_code: string;
  duration: string;
  price: number;
  provider: "FRESH" | "BITESHIP";
}

export interface IGetShippingRatesItem {
  productVariantId: number;
  quantity: number;
}
