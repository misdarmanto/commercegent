import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { IAddress, ICreateAddressPayload } from "@/interfaces/Address";
import { isLoggedIn } from "@/lib/auth/token";

export const addressKeys = {
  all: ["addresses"] as const,
  list: () => [...addressKeys.all, "list"] as const,
};

export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get("/addresses/users", {
        params: { addressCategory: "user", pagination: false },
      });
      return (data.data ?? []) as IAddress[];
    },
    enabled: isLoggedIn(),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ICreateAddressPayload) => {
      const { data } = await apiClient.post("/addresses/users", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}

export function useSetMainAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addressId: number) => {
      const { data } = await apiClient.patch("/addresses/to-main", { addressId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}

export function useRemoveAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addressId: number) => {
      const { data } = await apiClient.delete(`/addresses/${addressId}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}
