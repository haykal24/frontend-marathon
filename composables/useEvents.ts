/**
 * Composable untuk fetch events dari API
 */

import type { Event, EventsResponse } from '~/types/event'
import { useApi } from './useApi'

export const useEvents = () => {
  const api = useApi()

  /**
   * Fetch events dengan filter (public API - hanya published events)
   */
  const fetchEvents = async (params?: {
    page?: number
    per_page?: number
    month?: string // Format: YYYY-MM
    type?: string
    city?: string
    province?: string
    category?: string
    status?: 'published' | 'pending_review' | 'draft'
    search?: string
    sort?: 'latest' | 'featured'
    order_by?: string
    order?: 'asc' | 'desc'
    include?: string[]
  }) => {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params?.month) queryParams.append('month', params.month)
    if (params?.type) queryParams.append('type', params.type)
    if (params?.city) queryParams.append('city', params.city)
    if (params?.province) queryParams.append('province', params.province)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sort && params.sort !== 'latest') queryParams.append('sort', params.sort)
    if (params?.order_by) queryParams.append('order_by', params.order_by)
    if (params?.order) queryParams.append('order', params.order)
    if (params?.include?.length) queryParams.append('include', params.include.join(','))

    const query = queryParams.toString()
    const url = `/events${query ? `?${query}` : ''}`

    return await api.get<EventsResponse>(url)
  }

  /**
   * Fetch event by slug
   */
  const fetchEventBySlug = async (slug: string) => {
    return await api.get<{ data: Event }>(`/events/${slug}`)
  }

  /**
   * Fetch featured events (untuk homepage)
   */
  const fetchFeaturedEvents = async (limit: number = 6) => {
    return await fetchEvents({
      status: 'published',
      per_page: limit,
      sort: 'latest',
      include: ['categories'],
    })
  }

  /**
   * Fetch featured events for the hero slider.
   * @returns A promise that resolves to the API response.
   */
  const fetchFeaturedHeroEvents = async () => {
    return await api.get<{ data: Event[] }>('/events/featured-hero?include=categories')
  }

  /**
   * Fetch latest events
   */
  const fetchLatestEvents = async (limit: number = 6) => {
    return await fetchEvents({
      status: 'published',
      per_page: limit,
      sort: 'latest',
      include: ['categories'],
    })
  }

  /**
   * Fetch events by type
   */
  const fetchEventsByType = async (type: string, limit: number = 6) => {
    return await fetchEvents({
      type,
      status: 'published',
      per_page: limit,
      sort: 'latest',
      include: ['categories'],
    })
  }

  /**
   * Fetch events by province
   */
  const fetchEventsByProvince = async (province: string, limit: number = 6) => {
    return await fetchEvents({
      province,
      status: 'published',
      per_page: limit,
      sort: 'latest',
      include: ['categories'],
    })
  }

  /**
   * Fetch calendar statistics (count events per month for a given year)
   */
  const fetchCalendarStats = async (year?: number) => {
    interface CalendarStatsResponse {
      success: boolean
      message: string
      data: Record<number, number>
    }

    const params = new URLSearchParams()
    if (year) params.append('year', year.toString())

    const query = params.toString()
    const url = `/events/calendar-stats${query ? `?${query}` : ''}`

    const response = await api.get<CalendarStatsResponse>(url)
    return {
      data: response?.data && typeof response.data === 'object' ? response.data : {},
    }
  }

  return {
    fetchEvents,
    fetchEventBySlug,
    fetchFeaturedEvents,
    fetchLatestEvents,
    fetchEventsByType,
    fetchEventsByProvince,
    fetchFeaturedHeroEvents,
    fetchCalendarStats,
  }
}
