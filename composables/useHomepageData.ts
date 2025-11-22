import { useAsyncData } from '#app'
import { computed } from 'vue'
import type { Event, EventType, Province } from '~/types/event'
import type { BlogPost } from '~/types/blog'
import type { AdBanner } from '~/types/ad'
import type { ResponsiveAdBanners } from '~/types/ad'

// A generic type to represent the possible shapes of an API response that contains a list.
type ApiListResponse<T> = T[] | { data: T[] | { data: T[] } }

// Helper function to safely extract array data from API responses
const extractList = <T>(payload: ApiListResponse<T> | null): T[] => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if ('data' in payload) {
    if (Array.isArray(payload.data)) return payload.data
    // Handle cases like { data: { data: [...] } } which can occur in some API endpoints
    if (payload.data && 'data' in payload.data && Array.isArray(payload.data.data)) {
      return payload.data.data
    }
  }
  return []
}

export const useHomepageData = () => {
  const { currentYear } = useCurrentYear()

  const {
    fetchLatestEvents,
    fetchEventsByType,
    fetchEventsByProvince,
    fetchFeaturedHeroEvents,
    fetchCalendarStats,
  } = useEvents()
  const { fetchActiveEventTypes } = useEventTypes()
  const { fetchMajorProvinces } = useProvinces()
  const { fetchLatestBlogPosts } = useBlogPosts()
  const { fetchBannersBySlot, fetchResponsiveBanners } = useAdBanners()

  // OPTIMASI: Gunakan useState untuk persistent cache di client-side
  // Cache ini akan bertahan selama session dan instant pada back navigation
  const cachedHomepageData = useState<any>('homepage-cache', () => null)

  const {
    data: homepageData,
    error: _error,
    pending,
  } = useAsyncData(
    'homepage-overview',
    async () => {
      // OPTIMASI: Cache hanya untuk client-side navigation (back/forward)
      // Jangan gunakan cache saat SSR untuk memastikan IPX bisa optimize images
      if (cachedHomepageData.value && import.meta.client && !import.meta.server) {
        return cachedHomepageData.value
      }

      try {
        // OPTIMASI: Split menjadi critical dan non-critical data
        // Critical data: yang langsung terlihat di viewport pertama
        const criticalResults = await Promise.allSettled([
          fetchLatestEvents(6),           // 0 - Hero/Latest events
          fetchFeaturedHeroEvents(),      // 1 - Featured hero slider
          fetchBannersBySlot('homepage_slider'), // 2 - Slider banners
        ])

        // Non-critical data: yang di bawah fold atau tidak langsung terlihat
        const nonCriticalResults = await Promise.allSettled([
          fetchActiveEventTypes(),        // 0 - Event types section
          fetchMajorProvinces(),          // 1 - Provinces section
          fetchLatestBlogPosts(6),        // 2 - Blog section
          fetchBannersBySlot('homepage_cta'), // 3 - CTA banner
          fetchResponsiveBanners('banner_main'), // 4 - Banner main
          fetchResponsiveBanners('sidebar_1'), // 5 - Sidebar 1
          fetchResponsiveBanners('sidebar_2'), // 6 - Sidebar 2
        ])

        // Extract results
        const latestEvents = criticalResults[0]?.status === 'fulfilled' ? criticalResults[0].value : null
        const featuredHeroEvents = criticalResults[1]?.status === 'fulfilled' ? criticalResults[1].value : null
        const sliderBannerResult = criticalResults[2]?.status === 'fulfilled' ? criticalResults[2].value : null
        
        const eventTypes = nonCriticalResults[0]?.status === 'fulfilled' ? nonCriticalResults[0].value : null
        const provinces = nonCriticalResults[1]?.status === 'fulfilled' ? nonCriticalResults[1].value : null
        const blogPosts = nonCriticalResults[2]?.status === 'fulfilled' ? nonCriticalResults[2].value : null
        const ctaBannerResult = nonCriticalResults[3]?.status === 'fulfilled' ? nonCriticalResults[3].value : null
        const bannerMainResult = nonCriticalResults[4]?.status === 'fulfilled'
          ? (nonCriticalResults[4].value as ResponsiveAdBanners)
          : { desktop: [], mobile: [] }
        const sidebar1Result = nonCriticalResults[5]?.status === 'fulfilled'
          ? (nonCriticalResults[5].value as ResponsiveAdBanners)
          : { desktop: [], mobile: [] }
        const sidebar2Result = nonCriticalResults[6]?.status === 'fulfilled'
          ? (nonCriticalResults[6].value as ResponsiveAdBanners)
          : { desktop: [], mobile: [] }
      const ctaBanner =
        extractList<AdBanner>(ctaBannerResult as ApiListResponse<AdBanner>).length > 0
          ? extractList<AdBanner>(ctaBannerResult as ApiListResponse<AdBanner>)[0]
          : null

      // OPTIMASI: Fetch calendar stats hanya untuk tahun ini (tidak perlu 3 tahun)
      const calendarYears = [currentYear.value]
      
      const calendarStatsResponses = await Promise.allSettled(
        calendarYears.map(async year => {
          const stats = await fetchCalendarStats(year)
          return {
            year,
            stats: stats?.data && typeof stats.data === 'object' ? stats.data : {},
          }
        }),
      )

      const calendarStatsByYear: Record<number, Record<number, number>> = {}
      calendarStatsResponses.forEach(result => {
        if (result.status === 'fulfilled') {
          calendarStatsByYear[result.value.year] = result.value.stats
        }
      })

      const calendarStats = calendarStatsByYear[currentYear.value] ?? {}

      // OPTIMASI: Fetch events by type dan province secara parallel dengan limit lebih kecil
      const cleanEventTypes = extractList<EventType>(eventTypes as ApiListResponse<EventType>)
      const cleanProvinces = extractList<Province>(provinces as ApiListResponse<Province>)

      // Ambil hanya top 4 types dan 2 provinces untuk mengurangi request
      const topTypes = cleanEventTypes
        .filter(type => (type.event_count ?? 0) > 0)
        .sort((a, b) => (b.event_count ?? 0) - (a.event_count ?? 0))
        .slice(0, 4) // Reduced from 6 to 4

      const topProvinces = cleanProvinces.slice(0, 2) // Reduced from 3 to 2

      // Fetch semua sekaligus secara parallel
      const [typeResults, provinceResults] = await Promise.all([
        Promise.allSettled(
          topTypes.map(type => fetchEventsByType(type.slug, 2))
        ),
        Promise.allSettled(
          topProvinces.map(province => fetchEventsByProvince(province.slug, 2))
        ),
      ])

      const eventsByType: Record<string, Event[]> = {}
      typeResults.forEach((res, index) => {
        if (res.status === 'fulfilled' && res.value) {
          const selectedType = topTypes[index]
          if (selectedType) {
            eventsByType[selectedType.slug] = extractList<Event>(
              res.value as ApiListResponse<Event>
            )
          }
        }
      })

      const eventsByProvince: Record<string, Event[]> = {}
      provinceResults.forEach((res, index) => {
        if (res.status === 'fulfilled' && res.value) {
          const selectedProvince = topProvinces[index]
          if (selectedProvince) {
            eventsByProvince[selectedProvince.slug] = extractList<Event>(
              res.value as ApiListResponse<Event>
            )
          }
        }
      })

        // We return the raw results here
        const result = {
          latestEvents,
          eventTypes,
          provinces,
          blogPosts,
          featuredHeroEvents,
          sliderBanners: extractList<AdBanner>(sliderBannerResult as ApiListResponse<AdBanner>),
          ctaBanner,
          bannerMain: bannerMainResult,
          sidebar1: sidebar1Result,
          sidebar2: sidebar2Result,
          eventsByType,
          eventsByProvince,
          calendarStats,
          calendarStatsByYear,
        }

        // OPTIMASI: Simpan ke cache untuk instant back navigation
        if (import.meta.client) {
          cachedHomepageData.value = result
        }

        return result
      } catch (error) {
        // Return empty structure on error untuk graceful fallback
        return {
          latestEvents: null,
          eventTypes: null,
          provinces: null,
          blogPosts: null,
          featuredHeroEvents: null,
          sliderBanners: [],
          ctaBanner: null,
          bannerMain: { desktop: [], mobile: [] },
          sidebar1: { desktop: [], mobile: [] },
          sidebar2: { desktop: [], mobile: [] },
          eventsByType: {},
          eventsByProvince: {},
          calendarStats: {},
          calendarStatsByYear: {},
        }
      }
    },
    {
      server: true,
      lazy: false,
      // OPTIMASI: Aggressive client-side caching untuk homepage
      // Data homepage akan di-cache secara permanen di client-side untuk instant navigation
      // SWR di routeRules akan handle revalidation di background
      dedupe: 'defer',
      getCachedData: (key) => {
        const nuxtApp = useNuxtApp()
        
        // Prioritas cache dari payload (SSR/prerender)
        if (nuxtApp.payload.data[key] !== undefined) {
          return nuxtApp.payload.data[key]
        }
        
        // Fallback ke static data
        if (nuxtApp.static?.data?.[key] !== undefined) {
          return nuxtApp.static.data[key]
        }
        
        return undefined
      },
    }
  )

  return {
    pending,
    latestEvents: computed(() =>
      extractList<Event>(homepageData.value?.latestEvents as ApiListResponse<Event>)
    ),
    eventTypes: computed(() =>
      extractList<EventType>(homepageData.value?.eventTypes as ApiListResponse<EventType>)
    ),
    provinces: computed(() =>
      extractList<Province>(homepageData.value?.provinces as ApiListResponse<Province>)
    ),
    blogPosts: computed(() =>
      extractList<BlogPost>(homepageData.value?.blogPosts as ApiListResponse<BlogPost>)
    ),
    featuredHeroEvents: computed(() =>
      extractList<Event>(homepageData.value?.featuredHeroEvents as ApiListResponse<Event>)
    ),
    sliderBanners: computed<AdBanner[]>(() => homepageData.value?.sliderBanners ?? []),
    ctaBanner: computed(() => (homepageData.value?.ctaBanner as AdBanner | null) ?? null),
    bannerMain: computed<AdBanner[]>(() => homepageData.value?.bannerMain?.desktop ?? []),
    bannerMainMobile: computed<AdBanner[]>(() => {
      const data = homepageData.value?.bannerMain
      if (data?.mobile && data.mobile.length > 0) {
        return data.mobile
      }
      return data?.desktop ?? []
    }),
    bannerSidebar1: computed<AdBanner[]>(() => homepageData.value?.sidebar1?.desktop ?? []),
    bannerSidebar1Mobile: computed<AdBanner[]>(() => {
      const data = homepageData.value?.sidebar1
      if (data?.mobile && data.mobile.length > 0) {
        return data.mobile
      }
      return data?.desktop ?? []
    }),
    bannerSidebar2: computed<AdBanner[]>(() => homepageData.value?.sidebar2?.desktop ?? []),
    bannerSidebar2Mobile: computed<AdBanner[]>(() => {
      const data = homepageData.value?.sidebar2
      if (data?.mobile && data.mobile.length > 0) {
        return data.mobile
      }
      return data?.desktop ?? []
    }),
    eventsByType: computed(
      () => (homepageData.value?.eventsByType as Record<string, Event[]>) ?? {}
    ),
    eventsByProvince: computed(
      () => (homepageData.value?.eventsByProvince as Record<string, Event[]>) ?? {}
    ),
    calendarStats: computed(
      () => (homepageData.value?.calendarStats as Record<number, number>) ?? {}
    ),
    calendarStatsByYear: computed(
      () =>
        (homepageData.value?.calendarStatsByYear as Record<number, Record<number, number>>) ??
        undefined
    ),
  }
}
