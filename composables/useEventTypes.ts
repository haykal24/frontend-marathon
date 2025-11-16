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
   * Fetch all event types
   */
  const fetchEventTypes = async () => {
    const response = await api.get<ApiResponse<EventType[]>>('/event-types')
    return {
      data: response?.data && Array.isArray(response.data) ? response.data : [],
    }
  }

  /**
   * Fetch active event types only
   */
  const fetchActiveEventTypes = async () => {
    const response = await fetchEventTypes()
    if (!response || !response.data) {
      return { data: [] }
    }
    return {
      data: Array.isArray(response.data)
        ? response.data.filter(type => type.is_active !== false)
        : [],
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
