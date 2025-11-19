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

  const {
    data: homepageData,
    error: _error,
    pending,
  } = useAsyncData(
    'homepage-overview',
    async () => {
      const results = await Promise.allSettled([
        fetchLatestEvents(6),
        fetchActiveEventTypes(),
        fetchMajorProvinces(),
        fetchLatestBlogPosts(6),
        fetchFeaturedHeroEvents(),
        fetchBannersBySlot('homepage_slider'),
        fetchBannersBySlot('homepage_cta'),
        fetchResponsiveBanners('banner_main'),
        fetchResponsiveBanners('sidebar_1'),
        fetchResponsiveBanners('sidebar_2'),
        fetchCalendarStats(), // Fetch calendar stats (count per month)
      ])

      const latestEvents = results[0].status === 'fulfilled' ? results[0].value : null
      const eventTypes = results[1].status === 'fulfilled' ? results[1].value : null
      const provinces = results[2].status === 'fulfilled' ? results[2].value : null
      const blogPosts = results[3].status === 'fulfilled' ? results[3].value : null
      const featuredHeroEvents = results[4].status === 'fulfilled' ? results[4].value : null
      const sliderBannerResult = results[5].status === 'fulfilled' ? results[5].value : null
      const ctaBannerResult = results[6].status === 'fulfilled' ? results[6].value : null
      const bannerMainResult =
        results[7].status === 'fulfilled'
          ? (results[7].value as ResponsiveAdBanners)
          : { desktop: [], mobile: [] }
      const sidebar1Result =
        results[8].status === 'fulfilled'
          ? (results[8].value as ResponsiveAdBanners)
          : { desktop: [], mobile: [] }
      const sidebar2Result =
        results[9].status === 'fulfilled'
          ? (results[9].value as ResponsiveAdBanners)
          : { desktop: [], mobile: [] }
      const calendarStatsResult = results[10].status === 'fulfilled' ? results[10].value : null

      const ctaBanner =
        extractList<AdBanner>(ctaBannerResult as ApiListResponse<AdBanner>).length > 0
          ? extractList<AdBanner>(ctaBannerResult as ApiListResponse<AdBanner>)[0]
          : null

      const calendarStats =
        calendarStatsResult?.data && typeof calendarStatsResult.data === 'object'
          ? calendarStatsResult.data
          : {}

      const eventsByType: Record<string, Event[]> = {}
      const cleanEventTypes = extractList<EventType>(eventTypes as ApiListResponse<EventType>)
      if (cleanEventTypes.length > 0) {
        // Sort by event_count (descending) and take top 6
        const topTypes = cleanEventTypes
          .filter(type => (type.event_count ?? 0) > 0)
          .sort((a, b) => (b.event_count ?? 0) - (a.event_count ?? 0))
          .slice(0, 6)
        
        const typeFetchResults = await Promise.allSettled(
          topTypes.map(type => fetchEventsByType(type.slug, 2))
        )

        typeFetchResults.forEach((res, index) => {
          if (res.status === 'fulfilled' && res.value) {
            const selectedType = topTypes[index]
            if (selectedType) {
              eventsByType[selectedType.slug] = extractList<Event>(
                res.value as ApiListResponse<Event>
              )
            }
          }
        })
      }

      const eventsByProvince: Record<string, Event[]> = {}
      const cleanProvinces = extractList<Province>(provinces as ApiListResponse<Province>)
      if (cleanProvinces.length > 0) {
        const topProvinces = cleanProvinces.slice(0, 3)
        const provinceFetchResults = await Promise.allSettled(
          topProvinces.map(province => fetchEventsByProvince(province.slug, 2))
        )

        provinceFetchResults.forEach((res, index) => {
          if (res.status === 'fulfilled' && res.value) {
            const selectedProvince = topProvinces[index]
            if (selectedProvince) {
              eventsByProvince[selectedProvince.slug] = extractList<Event>(
                res.value as ApiListResponse<Event>
              )
            }
          }
        })
      }

      // We return the raw results here
      return {
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
      }
    },
    {
      server: true,
      lazy: false,
    }
  )

  if (process.dev && _error.value) {
    console.error('Error fetching homepage data:', _error.value)
  }

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
  }
}
