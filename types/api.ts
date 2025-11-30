// Re-export PaginatedResponse from ecosystem for convenience
export type { PaginatedResponse } from './ecosystem'

/**
 * Standard API response wrapper dari Laravel
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
  meta?: Record<string, unknown>
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

