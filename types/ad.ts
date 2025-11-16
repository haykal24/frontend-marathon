/**
 * Type definitions untuk Ad Banners
 */

export interface AdBanner {
  id: number
  name: string
  image?: string | null
  target_url: string
  slot_location: string
  is_active: boolean
  expires_at?: string | null
  created_at: string
  updated_at: string
}

export interface ResponsiveAdBanners {
  desktop: AdBanner[]
  mobile: AdBanner[]
}
