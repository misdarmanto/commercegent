import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { IPaginatedResult } from "@/interfaces/Product";
import { IBanner } from "@/interfaces/Banner";

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await apiClient.get("/banners", {
        params: { pagination: false },
      });
      return data.data as IPaginatedResult<IBanner>;
    },
  });
}
