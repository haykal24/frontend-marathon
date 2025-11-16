import type { RatePackage } from '~/types/rate-package'
import { useApi } from './useApi'

interface RatePackageResponse {
  data: RatePackage[]
  message?: string
  success?: boolean
}

type RatePackageQuery = Record<string, string | number | boolean | undefined>

export const useRatePackages = () => {
  const api = useApi()

  const fetchRatePackages = async (params?: RatePackageQuery) => {
    try {
      const query = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '')
            query.append(key, String(value))
        })
      }

      const suffix = query.toString() ? `?${query.toString()}` : ''
      const response = await api.get<RatePackageResponse>(`/rate-packages${suffix}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch rate packages:', error)
      return []
    }
  }

  const fetchRatePackageBySlug = async (slug: string) => {
    try {
      const response = await api.get<{ data: RatePackage }>(`/rate-packages/${slug}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch rate package ${slug}:`, error)
      return null
    }
  }

  return {
    fetchRatePackages,
    fetchRatePackageBySlug,
  }
}
