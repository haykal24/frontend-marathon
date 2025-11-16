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
    const response = await api.get<ApiResponse<Province[]>>('/provinces', {
      params,
    })
    return {
      data: response?.data && Array.isArray(response.data) ? response.data : [],
    }
  }

  /**
   * Fetch active provinces only (yang punya event)
   */
  const fetchActiveProvinces = async () => {
    const response = await fetchProvinces()
    if (!response || !response.data) {
      return { data: [] }
    }
    return {
      data: Array.isArray(response.data)
        ? response.data.filter(province => province.is_active && (province.event_count || 0) > 0)
        : [],
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
