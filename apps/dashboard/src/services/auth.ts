import { useMutation } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import type { ILoginAdmin } from "../validations/AuthSchema";

export function useLoginAdmin() {
  return useMutation({
    mutationFn: async (payload: ILoginAdmin) => {
      const { data } = await httpClient.post("/auth/admins/login", payload);
      return data.data as { token: string };
    },
  });
}
