import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import { buildTableQueryString, TableParams } from "./queryParams";
import type { IUser } from "../interfaces/User";
import type { PaginatedResult } from "./types";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: TableParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export function useCustomers(params: TableParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: async () => {
      const query = buildTableQueryString(params);
      const { data } = await httpClient.get(`/users${query}`);
      return data.data as PaginatedResult<IUser>;
    },
  });
}

export function useCustomer(customerId: string | undefined) {
  return useQuery({
    queryKey: customerKeys.detail(customerId ?? ""),
    queryFn: async () => {
      const { data } = await httpClient.get(`/users/detail/${customerId}`);
      return data.data as IUser;
    },
    enabled: customerId != null,
  });
}

export function useUpdateCustomerCoin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId: string; userCoin: number }) =>
      httpClient.patch("/users/update-coin", payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.userId),
      });
    },
  });
}
