import { toValue, computed } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useCurrentYear } from '~/composables/useCurrentYear'

interface StaticPageResponse {
  title: string
  slug: string
  content: string
  seo_title?: string | null
  seo_description?: string | null
}

interface UseStaticPageOptions {
  defaultTitle?: MaybeRefOrGetter<string>
  defaultDescription?: MaybeRefOrGetter<string>
  placeholders?: MaybeRefOrGetter<Record<string, string>>
}

export const useStaticPage = async (slug: string, options?: UseStaticPageOptions) => {
  const config = useRuntimeConfig()
  const siteSettings = useSiteSettings()
  const { currentYear } = useCurrentYear()

  const defaultTitle = toValue(options?.defaultTitle) ?? 'Halaman Statis'
  const defaultDescription = toValue(options?.defaultDescription) ?? ''

  const basePlaceholders = computed<Record<string, string>>(() => {
    const siteName = siteSettings.getSetting<string>('site_name', 'indonesiamarathon.com') ?? 'indonesiamarathon.com'
    const contactEmail =
      siteSettings.getSetting<string>('contact_email', 'kontak@indonesiamarathon.com') ?? 'kontak@indonesiamarathon.com'
    const contactWhatsapp =
      siteSettings.getSetting<string>('contact_whatsapp', '0812-0000-0000') ?? '0812-0000-0000'
    const contactAddress =
      siteSettings.getSetting<string>('contact_address', 'Jakarta, Indonesia') ?? 'Jakarta, Indonesia'
    const instagramHandle =
      siteSettings.getSetting<string>('instagram_handle', '@indonesiamarathon') ?? '@indonesiamarathon'
    const facebookUrl =
      siteSettings.getSetting<string>('facebook_url', 'https://facebook.com/indonesiamarathon') ??
      'https://facebook.com/indonesiamarathon'
    const twitterHandle =
      siteSettings.getSetting<string>('twitter_handle', '@indonesiamarathon') ?? '@indonesiamarathon'
    const tiktokHandle =
      siteSettings.getSetting<string>('tiktok_handle', '@indonesiamarathon') ?? '@indonesiamarathon'
    const lastUpdatedRaw =
      siteSettings.getSetting<string>('privacy_last_updated', new Date().toISOString()) ??
      new Date().toISOString()

    const formatLastUpdated = (value: string) => {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) {
        return value
      }

      try {
        const formatted = new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(date)

        return `${formatted} WIB`
      } catch {
        return `${date.toLocaleDateString('id-ID')} ${date.toLocaleTimeString('id-ID')} WIB`
      }
    }

    return {
      site_name: siteName,
      contact_email: contactEmail,
      contact_whatsapp: contactWhatsapp,
      contact_whatsapp_digits: contactWhatsapp.replace(/\D/g, ''),
      contact_address: contactAddress,
      instagram_handle: instagramHandle,
      facebook_url: facebookUrl,
      twitter_handle: twitterHandle,
      tiktok_handle: tiktokHandle,
      last_updated: formatLastUpdated(lastUpdatedRaw),
      current_year: String(currentYear.value),
    }
  })

  const mergedPlaceholders = computed<Record<string, string>>(() => ({
    ...basePlaceholders.value,
    ...(toValue(options?.placeholders) ?? {}),
  }))

  const fetchPage = async (): Promise<StaticPageResponse | null> => {
    try {
      const response = await $fetch<{ data: StaticPageResponse }>(`${config.public.apiBase}/pages/${slug}`)
      return response.data
    } catch (error) {
      if (process.dev) {
        console.error(`[useStaticPage] Failed to fetch page "${slug}":`, error)
      }
      return null
    }
  }

  const { data, pending, error, refresh } = await useAsyncData(`static-page-${slug}`, fetchPage, { server: true })

  const applyPlaceholders = (input?: string | null): string | null => {
    if (!input) return input ?? null
    let content = input
    Object.entries(mergedPlaceholders.value).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi')
      content = content.replace(regex, value)
    })
    return content
  }

  const page = computed<StaticPageResponse | null>(() => data.value ?? null)
  const title = computed(() => applyPlaceholders(page.value?.title) ?? defaultTitle)
  const seoTitle = computed(
    () => applyPlaceholders(page.value?.seo_title) ?? `${title.value} - ${basePlaceholders.value.site_name}`
  )
  const seoDescription = computed(
    () => applyPlaceholders(page.value?.seo_description ?? defaultDescription) ?? defaultDescription
  )

  const renderedContent = computed<string | null>(() => applyPlaceholders(page.value?.content))

  return {
    page,
    pending,
    error,
    refresh,
    title,
    seoTitle,
    seoDescription,
    renderedContent,
    placeholders: mergedPlaceholders,
  }
}

