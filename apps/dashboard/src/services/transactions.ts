import { useQuery } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import { buildTableQueryString, TableParams } from "./queryParams";
import type { ITransaction } from "../interfaces/Transaction";
import type { PaginatedResult } from "./types";

export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (params: TableParams) => [...transactionKeys.lists(), params] as const,
};

export function useTransactions(params: TableParams) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: async () => {
      const query = buildTableQueryString(params);
      const { data } = await httpClient.get(`/transactions${query}`);
      return data.data as PaginatedResult<ITransaction>;
    },
  });
}
