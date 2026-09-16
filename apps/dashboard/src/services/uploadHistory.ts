import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import { buildTableQueryString, TableParams } from "./queryParams";
import type { IProductUpload } from "../interfaces/Product";
import type { PaginatedResult } from "./types";

export const uploadHistoryKeys = {
  all: ["upload-histories"] as const,
  lists: () => [...uploadHistoryKeys.all, "list"] as const,
  list: (params: TableParams) => [...uploadHistoryKeys.lists(), params] as const,
};

export function useUploadHistories(params: TableParams) {
  return useQuery({
    queryKey: uploadHistoryKeys.list(params),
    queryFn: async () => {
      const query = buildTableQueryString(params);
      const { data } = await httpClient.get(
        `/upload-products/histories${query}`,
      );
      return data.data as PaginatedResult<IProductUpload>;
    },
  });
}

export function useUploadProductsExcelHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return httpClient.post("/upload-products", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadHistoryKeys.lists() });
    },
  });
}
