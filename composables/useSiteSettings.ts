import { useAsyncData, useRuntimeConfig } from '#app'
import { computed } from 'vue'
import type { SiteSettingResponse, SiteSettingValue } from '~/types/site-setting'
import { $fetch } from 'ofetch'

const SETTINGS_ENDPOINT = '/site-settings'

export const useSiteSettings = () => {
  const { data, pending, error, refresh } = useAsyncData(
      'site-settings',
      async () => {
        try {
          const config = useRuntimeConfig()
        const apiBase = config.public.apiBase as string
          
          // Build full URL
        const fullUrl = `${apiBase}${SETTINGS_ENDPOINT}`
          
          const response = await $fetch<{
            success: boolean
            message: string
            data: Record<string, SiteSettingValue>
            meta?: Record<string, unknown>
          }>(fullUrl)
          return response.data
        } catch (error) {
          // If API fetch fails, return empty settings with warning
          console.warn('Failed to fetch site settings:', error)
          return {} as SiteSettingResponse
        }
      },
      {
        server: true,
        lazy: false,
        default: () => ({} as SiteSettingResponse),
      dedupe: 'defer'
  }
  )

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
