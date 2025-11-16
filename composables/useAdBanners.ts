/**
 * Composable untuk fetch ad banners dari API
 */

import type { AdBanner } from '~/types/ad'
import type { ResponsiveAdBanners } from '~/types/ad'
import { useApi } from './useApi'

export const useAdBanners = () => {
  const api = useApi()

  async function fetchBannersBySlot(slot: string) {
    try {
      const response = await api.get<{ data: AdBanner[] }>(
        `/ad-banners?slot_location=${slot}&is_active=true`
      )
      return response.data
    } catch {
      return []
    }
  }

  async function fetchResponsiveBanners(slot: string): Promise<ResponsiveAdBanners> {
    const [desktop, mobile] = await Promise.all([
      fetchBannersBySlot(slot),
      fetchBannersBySlot(`${slot}_mobile`),
    ])

    return {
      desktop,
      mobile: mobile.length > 0 ? mobile : desktop,
    }
  }

  return {
    fetchBannersBySlot,
    fetchResponsiveBanners,
  }
}
