import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { ICreateOrderPayload, ICreateOrderResponse, IOrder } from "@/interfaces/Order";
import { IPaginatedResult } from "@/interfaces/Product";
import { isLoggedIn } from "@/lib/auth/token";

export const orderKeys = {
  all: ["orders"] as const,
  list: () => [...orderKeys.all, "list"] as const,
  detail: (id: number | string) => [...orderKeys.all, "detail", id] as const,
};

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get("/orders", {
        params: { pagination: false },
      });
      return data.data as IPaginatedResult<IOrder> | IOrder[];
    },
    enabled: isLoggedIn(),
  });
}

export function useOrder(orderId?: number | string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get(`/orders/detail/${orderId}`);
      return data.data as IOrder;
    },
    enabled: orderId != null && isLoggedIn(),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ICreateOrderPayload) => {
      const { data } = await apiClient.post("/orders", payload);
      return data.data as ICreateOrderResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
