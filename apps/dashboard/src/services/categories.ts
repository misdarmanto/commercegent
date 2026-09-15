import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import { buildTableQueryString, TableParams } from "./queryParams";
import type { ICategory, ICategoryCreate } from "../interfaces/Category";
import type { PaginatedResult } from "./types";

export interface CategoryOptionsFilter {
  categoryType: "parent" | "child";
  categoryReference?: number | string;
}

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params: TableParams & { categoryType?: string; categoryReference?: string }) =>
    [...categoryKeys.lists(), params] as const,
  options: (filter: CategoryOptionsFilter) =>
    [...categoryKeys.all, "options", filter] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

/** Paginated table list, for the parent/subcategory DataGrid views. */
export function useCategories(
  params: TableParams & { categoryType: "parent" | "child"; categoryReference?: string },
) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: async () => {
      const { categoryType, categoryReference, ...rest } = params;
      const query = buildTableQueryString({
        ...rest,
        filters: { ...rest.filters, categoryType, categoryReference },
      });
      const { data } = await httpClient.get(`/categories${query}`);
      return data.data as PaginatedResult<ICategory>;
    },
  });
}

/** Unpaginated option list, for select dropdowns (e.g. product form). */
export function useCategoryOptions(filter: CategoryOptionsFilter) {
  return useQuery({
    queryKey: categoryKeys.options(filter),
    queryFn: async () => {
      const search = new URLSearchParams(
        Object.entries(filter).reduce<Record<string, string>>((acc, [key, value]) => {
          if (value != null) acc[key] = String(value);
          return acc;
        }, {}),
      ).toString();
      const { data } = await httpClient.get(`/categories?${search}`);
      return (data.data?.items ?? []) as ICategory[];
    },
    enabled: filter.categoryType === "parent" || filter.categoryReference != null,
  });
}

export function useCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId ?? ""),
    queryFn: async () => {
      const { data } = await httpClient.get(`/categories/detail/${categoryId}`);
      return data.data as ICategory;
    },
    enabled: categoryId != null,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICategoryCreate) =>
      httpClient.post("/categories", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ICategoryCreate> & { categoryId: string }) =>
      httpClient.patch("/categories", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useRemoveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) =>
      httpClient.delete(`/categories?categoryId=${categoryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
