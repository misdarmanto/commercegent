export interface ICreateShippingDraftRequest {
  orderId: number;
}

export interface IConfirmShippingRequest {
  orderId: number;
}

export interface IShippingTrackInfo {
  waybill_id: string;
  courier: {
    company: "gojek" | "grab";
  };
  origin: {
    contact_name: string;
    address: string;
  };
  destination: {
    contact_name: string;
    address: string;
  };
  history: IShipingHistoryItem[];
  weight: number;
  status: string;
  link: string;
}

interface IShipingHistoryItem {
  note: string;
  status: string;
  updated_at: string;
}
