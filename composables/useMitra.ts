import { useApi } from './useApi'
import type { PaginatedResponse, ApiResponse } from '~/types/api'
import type { Event } from '~/types/event'

interface DashboardStats {
  total_events: number
  pending_count: number
  published_count: number
  draft_count: number
}

interface FetchMyEventsParams {
  page?: number
  per_page?: number
  status?: string
  search?: string
  sort?: 'latest' | 'upcoming'
}

export const useMitra = () => {
  const api = useApi()

  const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<{ data: DashboardStats }>('/mitra/dashboard-stats')
      return response.data
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      return {
        total_events: 0,
        pending_count: 0,
        published_count: 0,
        draft_count: 0,
      }
    }
  }

  const fetchMyEvents = async (params: FetchMyEventsParams = {}): Promise<PaginatedResponse<Event>> => {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', String(params.page))
    if (params.per_page) queryParams.append('per_page', String(params.per_page))
    if (params.status) queryParams.append('status', params.status)
    if (params.search) queryParams.append('search', params.search)
    if (params.sort) queryParams.append('sort', params.sort)

    const queryString = queryParams.toString()
    const url = `/mitra/events${queryString ? `?${queryString}` : ''}`

    try {
      // API returns: { success, message, data: [...], meta: {...} }
      // We need to unwrap to: { data: [...], meta: {...} }
      const response = await api.get<ApiResponse<Event[]> & { meta?: any }>(url)
      return {
        data: response.data || [],
        meta: response.meta,
      }
    } catch (error) {
      console.error('Failed to fetch my events:', error)
      return {
        data: [],
        meta: {
          pagination: {
            total: 0,
            count: 0,
            per_page: params.per_page || 12,
            current_page: params.page || 1,
            total_pages: 0,
          },
        },
      }
    }
  }

  const fetchMyEventById = async (id: number): Promise<Event> => {
      const response = await api.get<ApiResponse<Event>>(`/mitra/events/${id}`)
      return response.data
  }

  return {
    fetchDashboardStats,
    fetchMyEvents,
    fetchMyEventById,
  }
}

