/**
 * Shared pagination types and constants.
 * These are designed to be reused across all modules.
 */

/** Query params received from the client */
export interface PaginationParams {
  page: number
  pageSize: number
}

/** Standardized paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  totalPages: number
  page: number
  pageSize: number
}

/** Default pagination values */
export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 25,
  maxPageSize: 100,
} as const
