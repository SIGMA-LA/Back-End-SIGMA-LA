import { Response } from 'express'
import type { PaginatedResponse } from '../types/pagination.js'

/**
 * Common success response format.
 * Ensures consistent JSON structure: { "status": "success", "message"?: string, "data"?: unknown }
 */

export interface ApiResponse<T = unknown> {
  status: 'success'
  message?: string
  data?: T
}

export interface ApiErrorResponse {
  status: 'fail' | 'error'
  message: string
  errorCode: string
  details?: unknown
}

/**
 * Standardized success sender.
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  })
}

/**
 * Standardized paginated success sender.
 * Wraps PaginatedResponse inside the standard { status, data } envelope.
 */
export const sendPaginatedSuccess = <T>(
  res: Response,
  paginatedData: PaginatedResponse<T>,
  message?: string,
): Response<ApiResponse<PaginatedResponse<T>>> => {
  return res.status(200).json({
    status: 'success',
    message,
    data: paginatedData,
  })
}

/**
 * Standardized error sender.
 */
export const sendError = (
  res: Response,
  message: string,
  errorCode: string = 'INTERNAL_SERVER_ERROR',
  statusCode: number = 500,
  details?: unknown,
): Response<ApiErrorResponse> => {
  const status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
  return res.status(statusCode).json({
    status,
    message,
    errorCode,
    details,
  })
}
