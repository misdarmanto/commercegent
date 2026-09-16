import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fileUploadClient } from "./fileUploadClient";
import { buildTableQueryString, TableParams } from "./queryParams";
import type { IUpload } from "../interfaces/Upload";
import type { PaginatedResult } from "./types";

export const uploadKeys = {
  all: ["uploads"] as const,
  lists: () => [...uploadKeys.all, "list"] as const,
  list: (params: TableParams) => [...uploadKeys.lists(), params] as const,
};

export function useUploads(params: TableParams) {
  return useQuery({
    queryKey: uploadKeys.list(params),
    queryFn: async () => {
      const query = buildTableQueryString(params);
      const { data } = await fileUploadClient.get(`/${query}`);
      return data.data as PaginatedResult<IUpload>;
    },
  });
}

export function useRemoveUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => fileUploadClient.delete(`/${fileId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.lists() });
    },
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fileUploadClient.post("/", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.lists() });
    },
  });
}

export function useUploadZip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fileUploadClient.post("/zip", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.lists() });
    },
  });
}
