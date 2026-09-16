import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import { buildTableQueryString, TableParams } from "./queryParams";
import type { IUser } from "../interfaces/User";
import type { AdminForm } from "../validations/adminSchema";
import type { PaginatedResult } from "./types";

export const adminKeys = {
  all: ["admins"] as const,
  lists: () => [...adminKeys.all, "list"] as const,
  list: (params: TableParams) => [...adminKeys.lists(), params] as const,
  details: () => [...adminKeys.all, "detail"] as const,
  detail: (id: string) => [...adminKeys.details(), id] as const,
};

export function useAdmins(params: TableParams) {
  return useQuery({
    queryKey: adminKeys.list(params),
    queryFn: async () => {
      const query = buildTableQueryString(params);
      const { data } = await httpClient.get(`/admins${query}`);
      return data.data as PaginatedResult<IUser>;
    },
  });
}

export function useAdmin(adminId: string | undefined) {
  return useQuery({
    queryKey: adminKeys.detail(adminId ?? ""),
    queryFn: async () => {
      const { data } = await httpClient.get(`/admins/detail/${adminId}`);
      return data.data as IUser;
    },
    enabled: adminId != null,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminForm) =>
      httpClient.post("/admins/register", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
    },
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: AdminForm }) =>
      httpClient.patch("/admins", { ...formData, productId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
    },
  });
}

export function useRemoveAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      httpClient.delete(`/users?userId=${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
    },
  });
}
