import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { IGetShippingRatesItem, IShippingRate } from "@/interfaces/Shipping";
import { isLoggedIn } from "@/lib/auth/token";

export const shippingKeys = {
  all: ["shipping"] as const,
  rates: (items: IGetShippingRatesItem[]) =>
    [...shippingKeys.all, "rates", items] as const,
};

export function useShippingRates(
  items: IGetShippingRatesItem[],
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: shippingKeys.rates(items),
    queryFn: async () => {
      const { data } = await apiClient.post("/shipping/rates", items);
      return (data.data ?? []) as IShippingRate[];
    },
    enabled: (options?.enabled ?? true) && items.length > 0 && isLoggedIn(),
    retry: false,
  });
}
