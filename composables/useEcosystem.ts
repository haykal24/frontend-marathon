import type { EcosystemQuery, PaginatedResponse, RunningCommunity, Vendor } from '~/types/ecosystem'
import { useApi } from './useApi'

export const useEcosystem = () => {
  const api = useApi()

  const getRunningCommunities = async (params?: EcosystemQuery) => {
    return api.get<PaginatedResponse<RunningCommunity>>('/running-communities', { params })
  }

  const getVendors = async (params?: EcosystemQuery) => {
    return api.get<PaginatedResponse<Vendor>>('/vendors', { params })
  }

  return {
    getRunningCommunities,
    getVendors,
  }
}
