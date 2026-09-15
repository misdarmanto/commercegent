import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import { buildTableQueryString, TableParams } from "./queryParams";
import type { IListProduct } from "../interfaces/Product";
import type { PaginatedResult } from "./types";
import { productKeys } from "./products";

export const promotionKeys = {
  all: ["promotions"] as const,
  lists: () => [...promotionKeys.all, "list"] as const,
  list: (params: TableParams) => [...promotionKeys.lists(), params] as const,
};

export function usePromotions(params: TableParams) {
  return useQuery({
    queryKey: promotionKeys.list(params),
    queryFn: async () => {
      const query = buildTableQueryString(params);
      const { data } = await httpClient.get(`/promotions${query}`);
      return data.data as PaginatedResult<IListProduct>;
    },
  });
}

/** Products not yet highlighted, for the "add to promotion" picker. */
export function useHighlightCandidates(
  params: TableParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...productKeys.lists(), "highlight-candidates", params],
    queryFn: async () => {
      const query = buildTableQueryString({
        ...params,
        filters: { ...params.filters, productIsHighlight: false },
      });
      const { data } = await httpClient.get(`/products${query}`);
      return data.data as PaginatedResult<IListProduct>;
    },
    enabled: options?.enabled ?? true,
  });
}

export function useRemovePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) =>
      httpClient.delete(`/promotions?productId=${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
}

export function useSetHighlightedProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      products: Array<{ productId: number; productIsHighlight: boolean }>,
    ) => httpClient.patch("/promotions", { products }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
