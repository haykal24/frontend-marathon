import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

/**
 * Composable untuk SEO meta tags dinamis
 * Membaca data dari API (seo_title, seo_description) dan menetapkannya ke meta tags
 * Sesuai dengan alur kerja SEO: Backend mengisi meta title/description, Frontend membaca dari API
 */
export interface SeoMetaData {
  title?: MaybeRefOrGetter<string | null | undefined>
  description?: MaybeRefOrGetter<string | null | undefined>
  image?: MaybeRefOrGetter<string | null | undefined>
  url?: MaybeRefOrGetter<string | null | undefined>
  type?: MaybeRefOrGetter<'website' | 'article' | 'profile' | null | undefined>
  publishedTime?: MaybeRefOrGetter<string | null | undefined>
  modifiedTime?: MaybeRefOrGetter<string | null | undefined>
}

export const useSeoMetaDynamic = (metaData: SeoMetaData) => {
  const config = useRuntimeConfig()
  const route = useRoute()

  // Default values
  const siteUrl = config.public.siteUrl || 'http://localhost:3000'
  const currentUrl = `${siteUrl}${route.path}`

  const currentYear = new Date().getFullYear()

  // --- REFAKTOR BEST PRACTICE ---
  // Logika `title` disederhanakan.
  // Penambahan "| SiteName" sekarang sepenuhnya ditangani oleh `titleTemplate` di `app.vue`.
  // Ini menghilangkan redundansi dan menjadikan `app.vue` sebagai Single Source of Truth.
  const resolvedTitle = toValue(metaData.title) ?? undefined

  // Description: fallback ke default jika tidak ada
  const resolvedDescription =
    toValue(metaData.description) ||
    `Platform digital #1 di Indonesia sebagai pusat informasi dan komunitas event lari. Temukan jadwal lari ${currentYear} terlengkap, ekosistem vendor, dan artikel seputar dunia lari.`

  // Image: fallback ke default jika tidak ada
  const resolvedImage = toValue(metaData.image) || `${siteUrl}/og.webp`
  const resolvedUrl = toValue(metaData.url) || currentUrl
  const resolvedType = toValue(metaData.type) || 'website'
  const publishedTime = toValue(metaData.publishedTime)
  const modifiedTime = toValue(metaData.modifiedTime)

  // Use useSeoMeta from @nuxtjs/seo
  useSeoMeta({
    ...(resolvedTitle && { title: resolvedTitle }),
    description: resolvedDescription,
    ...(resolvedTitle && { ogTitle: resolvedTitle }),
    ogDescription: resolvedDescription,
    ogImage: resolvedImage,
    ogUrl: resolvedUrl,
    ogType: resolvedType,
    twitterCard: 'summary_large_image',
    ...(resolvedTitle && { twitterTitle: resolvedTitle }),
    twitterDescription: resolvedDescription,
    twitterImage: resolvedImage,
    ...(publishedTime && { articlePublishedTime: publishedTime }),
    ...(modifiedTime && { articleModifiedTime: modifiedTime }),
  })

  // NOTE: Canonical URL is automatically handled by @nuxtjs/seo module
  // No need to set manually - removing to avoid duplication

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    image: resolvedImage,
    url: resolvedUrl,
  }
}
