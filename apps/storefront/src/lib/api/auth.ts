import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";
import { ILoginPayload, IRegisterPayload } from "@/interfaces/User";
import { setToken } from "@/lib/auth/token";

interface IAuthResponse {
  token: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: ILoginPayload) => {
      const { data } = await apiClient.post("/auth/users/login", payload);
      return data.data as IAuthResponse;
    },
    onSuccess: (data) => {
      setToken(data.token);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: IRegisterPayload) => {
      await apiClient.post("/auth/users/register", payload);
    },
  });
}
