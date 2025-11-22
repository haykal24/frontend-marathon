import { useAsyncData, useRuntimeConfig } from '#app'
import type { BioLinkResponse, BioLink } from '~/types/bio-link'
import { $fetch } from 'ofetch'

export const useBioLinks = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  const { data, pending, error, refresh } = useAsyncData(
    'bio-links',
    async () => {
      try {
        // Skip if API base is invalid or localhost in production build
        if (!apiBase || (process.env.NODE_ENV === 'production' && !process.client && apiBase.includes('localhost'))) {
          return [] as BioLink[]
        }

        const response = await $fetch<BioLinkResponse>(`${apiBase}/bio-links`)
        return response.data || []
      } catch (err) {
        console.error('Failed to fetch bio links:', err)
        return [] as BioLink[]
      }
    },
    {
      default: () => [] as BioLink[],
      lazy: true, // Lazy load agar tidak blocking
    }
  )

  return {
    links: data,
    pending,
    error,
    refresh
  }
}

