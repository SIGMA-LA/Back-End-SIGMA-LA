import {
  PAGINATION_DEFAULTS,
  type PaginationParams,
} from '../types/pagination.js'

/**
 * Parses and validates pagination query parameters.
 * Clamps pageSize to maxPageSize and ensures page >= 1.
 */
export function parsePagination(
  query: Record<string, unknown>,
): PaginationParams {
  let page = Number(query.page)
  let pageSize = Number(query.pageSize)

  if (!Number.isFinite(page) || page < 1) {
    page = PAGINATION_DEFAULTS.page
  }

  if (!Number.isFinite(pageSize) || pageSize < 1) {
    pageSize = PAGINATION_DEFAULTS.pageSize
  }

  if (pageSize > PAGINATION_DEFAULTS.maxPageSize) {
    pageSize = PAGINATION_DEFAULTS.maxPageSize
  }

  return { page: Math.floor(page), pageSize: Math.floor(pageSize) }
}
