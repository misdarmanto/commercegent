import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import { buildTableQueryString, TableParams } from "./queryParams";
import type { IOrderDetail } from "../interfaces/Order";
import type {
  IConfirmShippingRequest,
  ICreateShippingDraftRequest,
  IShippingTrackInfo,
} from "../interfaces/Shipping";
import type { PaginatedResult } from "./types";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params: TableParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string | number) => [...orderKeys.details(), id] as const,
  tracking: (id: string | number) => [...orderKeys.all, "tracking", id] as const,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrderRow(item: any) {
  return {
    ...item,
    userName: item?.user?.userName,
    orderProductName: item?.product?.productName,
  };
}

export function useOrders(params: TableParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const query = buildTableQueryString(params);
      const { data } = await httpClient.get(`/orders${query}`);
      const result = data.data as PaginatedResult<Record<string, unknown>>;
      return { ...result, items: result.items.map(mapOrderRow) };
    },
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(orderId ?? ""),
    queryFn: async () => {
      const { data } = await httpClient.get(`/orders/detail/${orderId}`);
      return data.data as IOrderDetail;
    },
    enabled: orderId != null,
  });
}

export function useOrderShippingTracking(
  orderId: number | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: orderKeys.tracking(orderId ?? ""),
    queryFn: async () => {
      const { data } = await httpClient.get(
        `/shipping/tracking?orderId=${orderId}`,
      );
      return data.data as IShippingTrackInfo;
    },
    enabled: orderId != null && (options?.enabled ?? true),
  });
}

export function useCreateShippingDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICreateShippingDraftRequest) =>
      httpClient.post("/shipping/draft", payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
    },
  });
}

export function useConfirmShippingDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IConfirmShippingRequest) =>
      httpClient.post("/shipping/draft/confirm", payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
    },
  });
}
