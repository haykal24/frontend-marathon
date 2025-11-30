import type { EcosystemQuery, PaginatedResponse, RunningCommunity, Vendor } from '~/types/ecosystem'
import { useApi } from './useApi'

export const useEcosystem = () => {
  const api = useApi()

  const getRunningCommunities = async (params?: EcosystemQuery) => {
    return api.get<PaginatedResponse<RunningCommunity>>('/running-communities', { params })
  }

  const getRunningCommunityBySlug = async (slug: string) => {
    return api.get<{ data: RunningCommunity }>(`/running-communities/${slug}`)
  }

  const getVendors = async (params?: EcosystemQuery) => {
    return api.get<PaginatedResponse<Vendor>>('/vendors', { params })
  }

  const getVendorBySlug = async (slug: string) => {
    return api.get<{ data: Vendor }>(`/vendors/${slug}`)
  }

  return {
    getRunningCommunities,
    getRunningCommunityBySlug,
    getVendors,
    getVendorBySlug,
  }
}
