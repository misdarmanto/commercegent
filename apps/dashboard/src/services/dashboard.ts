import { useQuery } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import type { IStatisticTotal } from "../interfaces/Stats";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  statisticTotal: () => [...dashboardKeys.all, "statistic-total"] as const,
  visitorStatistic: (range: string, interval: string) =>
    [...dashboardKeys.all, "visitor-statistic", range, interval] as const,
};

export function useStatisticTotal() {
  return useQuery({
    queryKey: dashboardKeys.statisticTotal(),
    queryFn: async () => {
      const { data } = await httpClient.get("/statistic/total");
      return data.data as IStatisticTotal;
    },
  });
}

export interface VisitorStatisticPoint {
  date: string;
  total: number;
}

export function useVisitorStatistic(range: string, interval: string) {
  return useQuery({
    queryKey: dashboardKeys.visitorStatistic(range, interval),
    queryFn: async () => {
      const { data } = await httpClient.get(
        `/statistic/visitor?range=${range}&interval=${interval}`,
      );
      const result = data.data;
      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      return {
        categories: rows.map((item: { date: string }) => item.date),
        series: rows.map((item: { total: number | string }) =>
          Number(item.total ?? 0),
        ),
      };
    },
  });
}
