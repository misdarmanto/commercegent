import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosProgressEvent } from "axios";
import { fileUploadClient } from "./fileUploadClient";
import { buildTableQueryString, TableParams } from "./queryParams";
import type { IUpload } from "../interfaces/Upload";
import type { PaginatedResult } from "./types";

export const uploadKeys = {
  all: ["uploads"] as const,
  lists: () => [...uploadKeys.all, "list"] as const,
  list: (params: TableParams) => [...uploadKeys.lists(), params] as const,
};

export function useUploads(
  params: TableParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: uploadKeys.list(params),
    queryFn: async () => {
      const query = buildTableQueryString(params);
      const { data } = await fileUploadClient.get(`/${query}`);
      return data.data as PaginatedResult<IUpload>;
    },
    enabled: options?.enabled ?? true,
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

export interface UploadImageVariables {
  file: File;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, onUploadProgress }: UploadImageVariables) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await fileUploadClient.post("/", formData, {
        onUploadProgress,
      });
      return data as { url: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.lists() });
    },
  });
}

export function useUploadZip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await fileUploadClient.post("/zip", formData);
      return data as { fileName?: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.lists() });
    },
  });
}
