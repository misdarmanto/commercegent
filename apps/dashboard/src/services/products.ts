import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import { buildTableQueryString, TableParams } from "./queryParams";
import type {
  IListProduct,
  IProduct,
  IProductCreate,
  IProductUpdate,
} from "../interfaces/Product";
import type { PaginatedResult } from "./types";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: TableParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number | string) => [...productKeys.details(), id] as const,
};

export function useProducts(params: TableParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const query = buildTableQueryString(params);
      const { data } = await httpClient.get(`/products/admin${query}`);
      return data.data as PaginatedResult<IListProduct>;
    },
  });
}

export function useProduct(productId: string | number | undefined) {
  return useQuery({
    queryKey: productKeys.detail(productId ?? ""),
    queryFn: async () => {
      const { data } = await httpClient.get(`/products/detail/${productId}`);
      return data.data as IProduct;
    },
    enabled: productId != null,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IProductCreate) =>
      httpClient.post("/products", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IProductUpdate) =>
      httpClient.patch("/products", payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
  });
}

export function useRemoveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) =>
      httpClient.delete(`/products?productId=${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUploadProductsExcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return httpClient.post("/products/upload-excel", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
