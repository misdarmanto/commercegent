import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { IPaginatedResult, ICategory } from "@/interfaces/Product";

export function useCategories() {
  return useQuery({
    queryKey: ["categories", "parent"],
    queryFn: async () => {
      const { data } = await apiClient.get("/categories", {
        params: { pagination: false, categoryType: "parent" },
      });
      return data.data as IPaginatedResult<ICategory> | ICategory[];
    },
  });
}
