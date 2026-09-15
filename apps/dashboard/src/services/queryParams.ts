/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TableParams {
  page?: number;
  size?: number;
  pagination?: boolean;
  filters?: Record<string, any>;
}

/** Builds the `?pagination=&page=&size=&...filters` query string used by list endpoints. */
export function buildTableQueryString({
  page = 1,
  size = 10,
  pagination = true,
  filters,
}: TableParams): string {
  const queryFilter = new URLSearchParams(filters).toString();
  return `?pagination=${pagination}&page=${page}&size=${size}&${queryFilter}`;
}
