/**
 * Composable untuk fetch provinces dari API
 */

import type { Province } from '../types/event'
import { useApi } from './useApi'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useProvinces = () => {
  const api = useApi()

  /**
   * Fetch all provinces
   */
  const fetchProvinces = async (params?: Record<string, string | number | boolean>) => {
    try {
    const response = await api.get<ApiResponse<Province[]>>('/provinces', {
      params,
    })
      
      // Handle different response formats
      if (response && 'data' in response) {
        const data = response.data
    return {
          data: Array.isArray(data) ? data : [],
        }
      }
      
      // If response is directly an array (unlikely but handle it)
      if (Array.isArray(response)) {
        return { data: response }
      }
      
      return { data: [] }
    } catch (error) {
      return { data: [] }
    }
  }

  /**
   * Fetch active provinces only (yang punya event)
   */
  const fetchActiveProvinces = async () => {
    try {
    const response = await fetchProvinces()
    if (!response || !response.data) {
      return { data: [] }
    }
      
      const filtered = Array.isArray(response.data)
        ? response.data.filter(province => {
            const isActive = province.is_active !== false // Default to true if undefined
            const hasEvents = (province.event_count || 0) > 0
            return isActive && hasEvents
          })
        : []
      
      return { data: filtered }
    } catch (error) {
      return { data: [] }
    }
  }

  /**
   * Fetch major provinces (untuk homepage)
   * Provinsi besar: Jakarta, Jawa Barat, Jawa Tengah, Jawa Timur, Bali, Sumatera Utara, dll
   */
  const fetchMajorProvinces = async () => {
    const response = await fetchProvinces({ featured: true })
    if (!response || !response.data || !Array.isArray(response.data)) {
      return { data: [] }
    }

    return {
      data: response.data,
    }
  }

  /**
   * Fetch province by slug
   */
  const fetchProvinceBySlug = async (slug: string) => {
    return await api.get<ApiResponse<Province>>(`/provinces/${slug}`)
  }

  return {
    fetchProvinces,
    fetchActiveProvinces,
    fetchMajorProvinces,
    fetchProvinceBySlug,
  }
}
