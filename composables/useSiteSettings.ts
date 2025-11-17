import { useAsyncData, useRuntimeConfig } from '#app'
import { computed } from 'vue'
import type { SiteSettingResponse, SiteSettingValue } from '~/types/site-setting'
import { $fetch } from 'ofetch'

const SETTINGS_ENDPOINT = '/site-settings'

// We store the asyncData result here to ensure it's only created once per lifecycle.
let siteSettingsData: ReturnType<typeof useAsyncData> | null = null
let hasClientRefreshed = false

export const useSiteSettings = () => {
  if (!siteSettingsData) {
    siteSettingsData = useAsyncData(
      'site-settings',
      async () => {
        try {
          const config = useRuntimeConfig()
          const apiBase = config.public.apiBase
          
          // Ensure we have a valid base URL
          if (!apiBase || apiBase === 'http://localhost:8000/api/v1') {
            // During build/prerender, return empty settings
            if (process.env.NODE_ENV === 'production' && !process.client) {
              return {} as SiteSettingResponse
            }
          }
          
          // Build full URL
          const fullUrl = apiBase.startsWith('http') 
            ? `${apiBase}${SETTINGS_ENDPOINT}`
            : `http://localhost:8000/api/v1${SETTINGS_ENDPOINT}`
          
          const response = await $fetch<{
            success: boolean
            message: string
            data: Record<string, SiteSettingValue>
            meta?: Record<string, unknown>
          }>(fullUrl)
          return response.data
        } catch (error) {
          // During build/prerender, return empty settings if API is not available
          console.warn('Failed to fetch site settings:', error)
          return {} as SiteSettingResponse
        }
      },
      {
        server: true,
        lazy: false,
        default: () => ({} as SiteSettingResponse),
      }
    )
  }

  const { data, pending, error, refresh } = siteSettingsData

  if (process.client && !hasClientRefreshed) {
    hasClientRefreshed = true
    refresh()
  }

  const getSetting = <T = string | null>(key: string, fallback: T | null = null): T | null => {
    const settings = (data.value as SiteSettingResponse | undefined) ?? {}
    const setting = settings[key]
    if (!setting) {
      return fallback
    }

    return (setting.value as T) ?? fallback
  }

  const getImage = (key: string, fallback: string | null = null): string | null => {
    const value = getSetting<string | null>(key, fallback)
    return value ?? fallback
  }

  return {
    pending,
    error,
    refresh,
    settings: computed(() => (data.value as SiteSettingResponse | undefined) ?? {}),
    getSetting,
    getImage,
  }
}
