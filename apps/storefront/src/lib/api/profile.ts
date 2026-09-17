import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { IUpdateProfilePayload, IUserProfile } from "@/interfaces/User";
import { isLoggedIn } from "@/lib/auth/token";

export const profileKeys = {
  all: ["profile"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: async () => {
      const { data } = await apiClient.get("/my-profiles");
      return data.data as IUserProfile;
    },
    enabled: isLoggedIn(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: IUpdateProfilePayload) => {
      const { data } = await apiClient.patch("/my-profiles", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
