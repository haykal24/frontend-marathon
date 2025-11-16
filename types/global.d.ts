import 'pinia'
import type {
  RouteLocationRaw,
  RouteLocationNormalized,
  NavigationFailure,
  RouteLocationNormalizedLoaded,
} from 'vue-router'
import type { Event } from './event'
import type { BlogPost } from './blog'
import type { AdBanner, ResponsiveAdBanners } from './ad'
import type { UseHeadInput } from '@unhead/vue'
import type { EventSchemaData } from '~/composables/useEventSchema'

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface PiniaCustomProperties {
    // Add custom properties if needed
  }

  // Extend Pinia store definition to support persist plugin
  export interface DefineStoreOptionsBase {
    persist?: {
      storage?: Storage | undefined
      paths?: string[]
      [key: string]: unknown
    }
  }
}

// ImportMeta extension for Nuxt
interface ImportMeta {
  readonly client: boolean
  readonly server: boolean
}

type ApiListResponse<T> = T[] | { data: T[] }

interface EventsComposables {
  fetchLatestEvents: (limit?: number) => Promise<ApiListResponse<Event>>
  fetchEventsByType: (slug: string, limit?: number) => Promise<ApiListResponse<Event>>
  fetchEventsByProvince: (slug: string, limit?: number) => Promise<ApiListResponse<Event>>
  fetchFeaturedHeroEvents: () => Promise<ApiListResponse<Event>>
  fetchCalendarStats: (year?: number) => Promise<{ data: Record<number, number> }>
  searchEvents: (params: Record<string, string | number>) => Promise<ApiListResponse<Event>>
  fetchEventBySlug: (slug: string) => Promise<{ data: Event }>
}

interface EventTypesComposables {
  fetchActiveEventTypes: () => Promise<ApiListResponse<EventType>>
}

interface ProvincesComposables {
  fetchMajorProvinces: () => Promise<ApiListResponse<Province>>
}

interface BlogPostsComposables {
  fetchLatestBlogPosts: (limit?: number) => Promise<ApiListResponse<BlogPost>>
  fetchPostBySlug: (slug: string) => Promise<{ data: BlogPost }>
  fetchAllPosts: (params: Record<string, string | number>) => Promise<ApiListResponse<BlogPost>>
}

interface AdBannersComposables {
  fetchBannersBySlot: (slot: string) => Promise<ApiListResponse<AdBanner>>
  fetchResponsiveBanners: (slot: string) => Promise<ResponsiveAdBanners>
}

interface CtaLinks {
  primary: { text: string; to: string }
  secondary?: { text: string; to: string }
}

// Nuxt auto-imports type declarations
// These will be properly typed after running `nuxt prepare`
declare global {
  // eslint-disable-next-line no-var
  var useRuntimeConfig: () => {
    public: {
      apiBase: string
      siteUrl: string
      appName: string
    }
  }

  // eslint-disable-next-line no-var
  var navigateTo: (to: string | RouteLocationRaw) => Promise<void | NavigationFailure | undefined>

  // eslint-disable-next-line no-var
  var defineNuxtRouteMiddleware: (
    middleware: (to: RouteLocationNormalized) => void | Promise<void> | RouteLocationRaw
  ) => unknown

  // eslint-disable-next-line no-var
  var useRoute: () => RouteLocationNormalizedLoaded

  // eslint-disable-next-line no-var
  var useHead: (head: UseHeadInput) => void

  // eslint-disable-next-line no-var
  var useSeoMeta: (meta: Record<string, string>) => void

  // eslint-disable-next-line no-var
  var useSchemaOrg: (schema: Array<Record<string, unknown>>) => void

  // eslint-disable-next-line no-var
  var ref: <T>(value: T) => { value: T }

  // Custom composables
  // eslint-disable-next-line no-var
  var useSeoMetaDynamic: (meta: Record<string, string>) => void

  // eslint-disable-next-line no-var
  var useEventSchema: (data: EventSchemaData) => Record<string, unknown>

  // eslint-disable-next-line no-var
  var useEventInternalLinks: (
    category?: string,
    type?: string,
    city?: string
  ) => Array<{ text: string; to: string }>

  // eslint-disable-next-line no-var
  var useBlogInternalLinks: (topic?: string) => Array<{ text: string; to: string }>

  // eslint-disable-next-line no-var
  var useCtaLinks: (eventType: string, city?: string) => CtaLinks

  // eslint-disable-next-line no-var
  var useEvents: () => EventsComposables

  // eslint-disable-next-line no-var
  var useEventTypes: () => EventTypesComposables

  // eslint-disable-next-line no-var
  var useProvinces: () => ProvincesComposables

  // eslint-disable-next-line no-var
  var useBlogPosts: () => BlogPostsComposables

  // eslint-disable-next-line no-var
  var useAdBanners: () => AdBannersComposables
}
