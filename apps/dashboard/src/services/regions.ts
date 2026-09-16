import { useQuery } from "@tanstack/react-query";
import { httpClient } from "./httpClient";

export interface RegionOption {
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
      const { data } = await httpClient.get("/regions/provinces");
      return (data.data ?? []) as RegionOption[];
    },
    staleTime: Infinity,
  });
}

/**
 * Region cascades (regency/district/village) are fetched imperatively from
 * onChange handlers that also need to look up the selected option's name to
 * write into a react-hook-form field, so they stay as plain async helpers
 * rather than useQuery hooks.
 */
export async function fetchRegencies(
  provinceId: string,
): Promise<RegionOption[]> {
  const { data } = await httpClient.get(`/regions/regencies/${provinceId}`);
  return (data.data ?? []) as RegionOption[];
}

export async function fetchDistricts(
  regencyId: string,
): Promise<RegionOption[]> {
  const { data } = await httpClient.get(`/regions/districts/${regencyId}`);
  return (data.data ?? []) as RegionOption[];
}

export async function fetchVillages(
  districtId: string,
): Promise<RegionOption[]> {
  const { data } = await httpClient.get(`/regions/villages/${districtId}`);
  return (data.data ?? []) as RegionOption[];
}
