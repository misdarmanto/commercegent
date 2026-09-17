import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  ICartItem,
  ICreateCartPayload,
  IUpdateCartPayload,
} from "@/interfaces/Cart";
import { IPaginatedResult } from "@/interfaces/Product";
import { isLoggedIn } from "@/lib/auth/token";

export const cartKeys = {
  all: ["cart"] as const,
  list: () => [...cartKeys.all, "list"] as const,
  total: () => [...cartKeys.all, "total"] as const,
};

export function useCart() {
  return useQuery({
    queryKey: cartKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get("/carts", {
        params: { pagination: false },
      });
      return data.data as IPaginatedResult<ICartItem> | ICartItem[];
    },
    enabled: isLoggedIn(),
  });
}

export function useCartTotal() {
  return useQuery({
    queryKey: cartKeys.total(),
    queryFn: async () => {
      const { data } = await apiClient.get("/carts/total");
      return data.data as { total: number };
    },
    enabled: isLoggedIn(),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ICreateCartPayload) => {
      const { data } = await apiClient.post("/carts", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useUpdateCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: IUpdateCartPayload) => {
      const { data } = await apiClient.patch("/carts", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useRemoveCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cartId: number | string) => {
      const { data } = await apiClient.delete("/carts", {
        params: { cartId },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
