/** Shape returned by every paginated list endpoint (see Pagination.formatData on the API). */
export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
