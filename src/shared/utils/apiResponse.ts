import { Response } from 'express'

/**
 * Common success response format.
 * Ensures consistent JSON structure: { "status": "success", "message"?: string, "data"?: any }
 * Wait, the user said NO ANY.
 * I'll use `unknown` or a generic.
 */

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error'
  message?: string
  data?: T
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
