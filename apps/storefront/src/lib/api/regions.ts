import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface IRegionOption {
  id: string;
  name: string;
}

export const regionKeys = {
  all: ["regions"] as const,
  provinces: () => [...regionKeys.all, "provinces"] as const,
};

export function useProvinces() {
  return useQuery({
    queryKey: regionKeys.provinces(),
    queryFn: async () => {
      const { data } = await apiClient.get("/regions/provinces");
      return (data.data ?? []) as IRegionOption[];
    },
    staleTime: Infinity,
  });
}

/**
 * Region cascades (regency/district/village) are fetched imperatively from
 * onChange handlers that also need the selected option's name to fill a
 * react-hook-form field, so they stay as plain async helpers rather than
 * useQuery hooks.
 */
export async function fetchRegencies(provinceId: string): Promise<IRegionOption[]> {
  const { data } = await apiClient.get(`/regions/regencies/${provinceId}`);
  return (data.data ?? []) as IRegionOption[];
}

export async function fetchDistricts(regencyId: string): Promise<IRegionOption[]> {
  const { data } = await apiClient.get(`/regions/districts/${regencyId}`);
  return (data.data ?? []) as IRegionOption[];
}

export async function fetchVillages(districtId: string): Promise<IRegionOption[]> {
  const { data } = await apiClient.get(`/regions/villages/${districtId}`);
  return (data.data ?? []) as IRegionOption[];
}
