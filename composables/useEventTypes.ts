/**
 * Composable untuk fetch event types dari API
 */

import type { EventType } from '../types/event'
import { useApi } from './useApi'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useEventTypes = () => {
  const api = useApi()

  /**
   * Fetch all event types (with pagination support)
   */
  const fetchEventTypes = async (params?: { page?: number; per_page?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    
    const query = queryParams.toString()
    const url = `/event-types${query ? `?${query}` : ''}`
    
    const response = await api.get<ApiResponse<EventType[]> & { meta?: { pagination?: any } }>(url)
    return {
      data: response?.data && Array.isArray(response.data) ? response.data : [],
      meta: response?.meta || undefined,
    }
  }

  /**
   * Fetch active event types only (with pagination support)
   */
  const fetchActiveEventTypes = async (params?: { page?: number; per_page?: number }) => {
    const response = await fetchEventTypes(params)
    if (!response || !response.data) {
      return { data: [], meta: response?.meta }
    }
    return {
      data: Array.isArray(response.data)
        ? response.data.filter(type => type.is_active !== false)
        : [],
      meta: response.meta,
    }
  }

  /**
   * Fetch event type by slug
   */
  const fetchEventTypeBySlug = async (slug: string) => {
    return await api.get<ApiResponse<EventType>>(`/event-types/${slug}`)
  }

  return {
    fetchEventTypes,
    fetchActiveEventTypes,
    fetchEventTypeBySlug,
  }
}
