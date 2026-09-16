import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import type { IUser } from "../interfaces/User";

export const myProfileKeys = {
  all: ["my-profile"] as const,
};

export function useMyProfile() {
  return useQuery({
    queryKey: myProfileKeys.all,
    queryFn: async () => {
      const { data } = await httpClient.get("/my-profiles");
      return data.data as IUser;
    },
  });
}

/** Mirrors the (pre-existing) singular endpoint used only by the edit form. */
export function useMyProfileForEdit() {
  return useQuery({
    queryKey: [...myProfileKeys.all, "edit"],
    queryFn: async () => {
      const { data } = await httpClient.get("/my-profile");
      return data.data as Partial<IUser>;
    },
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      userId: string | number;
      userName: string;
      userPassword: string;
    }) => httpClient.patch("/my-profiles", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myProfileKeys.all });
    },
  });
}
