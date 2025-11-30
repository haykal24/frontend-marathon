/**
 * Composable untuk fetch cities dari API
 */

import { useApi } from './useApi'

export interface City {
  city: string
  province: string
  event_count: number
}

// ApiResponse type is imported from types/api.ts

export const useCities = () => {
  const api = useApi()

  /**
   * Fetch all cities with events
   */
  const fetchCities = async () => {
    try {
      const response = await api.get<City[] | { data: City[] }>('/events/cities')
      
      // Handle different response formats
      // If response is wrapped in { data: [...] }
      if (response && typeof response === 'object' && 'data' in response) {
        const data = (response as { data: City[] }).data
        return {
          data: Array.isArray(data) ? data : [],
        }
      }
      
      // If response is directly an array
      if (Array.isArray(response)) {
        return { data: response }
      }
      
      return { data: [] }
    } catch (error) {
      console.error('Error fetching cities:', error)
      return { data: [] }
    }
  }

  /**
   * Fetch city by slug (convert slug back to city name)
   */
  const fetchCityBySlug = async (slug: string) => {
    try {
      // Convert slug to city name (e.g., "bandung" -> "Bandung")
      const cityName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // Fetch events for this city to get city data
      const eventsResponse = await api.get<{ data: Array<{ city?: string; province?: string }>; meta?: { pagination?: { total?: number } } }>('/events', {
        params: {
          city: cityName,
          per_page: 1,
        },
      })
      
      if (eventsResponse && 'data' in eventsResponse && Array.isArray(eventsResponse.data) && eventsResponse.data.length > 0) {
        const firstEvent = eventsResponse.data[0]
        if (firstEvent) {
          return {
            data: {
              city: firstEvent.city || cityName,
              province: firstEvent.province || '',
              event_count: eventsResponse.meta?.pagination?.total || 0,
            },
          }
        }
      }
      
      return {
        data: {
          city: cityName,
          province: '',
          event_count: 0,
        },
      }
    } catch (error) {
      console.error('Error fetching city by slug:', error)
      return {
        data: {
          city: slug,
          province: '',
          event_count: 0,
        },
      }
    }
  }

  return {
    fetchCities,
    fetchCityBySlug,
  }
}

