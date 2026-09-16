import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  IPaginatedResult,
  IProductDetail,
  IProductListItem,
} from "@/interfaces/Product";

export interface IProductFilters {
  page?: number;
  size?: number;
  search?: string;
}

export function useProducts(filters: IProductFilters = {}) {
  const { page = 1, size = 12, search } = filters;

  return useQuery({
    queryKey: ["products", { page, size, search }],
    queryFn: async () => {
      const { data } = await apiClient.get("/products", {
        params: { page, size, pagination: true, search },
      });
      return data.data as IPaginatedResult<IProductListItem>;
    },
  });
}

export function useHighlightedProducts() {
  return useQuery({
    queryKey: ["products", "highlights"],
    queryFn: async () => {
      const { data } = await apiClient.get("/products/highlights", {
        params: { pagination: true, page: 1, size: 8 },
      });
      return data.data as IPaginatedResult<IProductListItem>;
    },
  });
}

export function useProduct(productId?: string | number) {
  return useQuery({
    queryKey: ["products", "detail", productId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/products/detail/${productId}`);
      return data.data as IProductDetail;
    },
    enabled: productId != null,
  });
}
