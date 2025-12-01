<script setup lang="ts">
/**
 * Halaman Landing Page Dinamis - Event berdasarkan Kategori/Tipe
 * 
 * URL: /event/kategori/road_run
 * SEO Strategy: Programmatic SEO untuk ranking #1 keyword kategori
 * TIDAK ADA DI NAVIGATION - hanya untuk breadcrumb & sitemap
 */

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { createError } from 'h3'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useEventTypes } from '~/composables/useEventTypes'
import { useAdBanners } from '~/composables/useAdBanners'
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema'
import { useEventListing, type EventFilterState } from '~/composables/useEventListing'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import IconHeroiconsMapPin20Solid from '~icons/heroicons/map-pin-20-solid'
import IconHeroiconsTag20Solid from '~icons/heroicons/tag-20-solid'
import IconHeroiconsBookOpen20Solid from '~icons/heroicons/book-open-20-solid'
import IconHeroiconsUserGroup20Solid from '~icons/heroicons/user-group-20-solid'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'
import EventCard from '~/components/event/EventCard.vue'
import EventCardSkeleton from '~/components/event/EventCardSkeleton.vue'
import { formatEventMeta, formatEventDateRange } from '~/utils/format'
import UiAppButton from '~/components/ui/AppButton.vue'

const route = useRoute()
const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchEventTypeBySlug } = useEventTypes()
const { fetchResponsiveBanners } = useAdBanners()

const kategoriSlug = route.params.slug as string

// Fetch event type data
const { data: eventTypeData, error: eventTypeError } = await useAsyncData(
  `event-type-${kategoriSlug}`,
  async () => {
    if (!kategoriSlug) {
      throw createError({ statusCode: 404, statusMessage: 'Slug kategori tidak valid', fatal: true })
    }
    return await fetchEventTypeBySlug(kategoriSlug)
  }
)

const eventType = computed(() => eventTypeData.value?.data ?? null)

if (eventTypeError.value || !eventType.value) {
  throw createError({ statusCode: 404, statusMessage: 'Kategori event tidak ditemukan', fatal: true })
}

// Setup filters untuk useEventListing
const filters = ref<EventFilterState>({
  search: '',
  month: '',
  province: [],
  type: kategoriSlug, // Set type filter ke kategori slug
  sort: 'latest', // Default: terbaru dulu
  year: '',
})

// Use useEventListing composable untuk pagination dan sorting
const {
  events,
  pending,
  currentPage,
  lastPage,
  totalCount,
  loadMore,
} = useEventListing(filters)

// SEO: Dynamic title dan description (ambil dari API, tidak hardcode)
const currentYear = new Date().getFullYear()
const categoryName = computed(() => eventType.value?.name || 'Event Lari')
const categoryDesc = computed(() => eventType.value?.description || `event ${eventType.value?.name?.toLowerCase() || 'lari'}`)

const seoTitle = computed(() => 
  `Jadwal Event ${categoryName.value} ${currentYear} - Kalender Lari Indonesia`
)
const seoDescription = computed(() => 
  `Temukan ${totalCount.value}+ jadwal ${categoryDesc.value} terbaru di Indonesia untuk ${currentYear}. Filter berdasarkan kota, tanggal, dan biaya pendaftaran. Update setiap hari!`
)

useSeoMetaDynamic({
  title: seoTitle.value,
  description: seoDescription.value,
  url: `/event/kategori/${kategoriSlug}`,
  type: 'website',
})

// Schema.org: CollectionPage
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/event/kategori/${kategoriSlug}`,
    name: seoTitle.value,
    description: seoDescription.value,
    '@type': 'CollectionPage',
  }),
  // ItemList untuk SEO
  defineItemList({
    itemListElement: computed(() =>
      events.value.slice(0, 20).map((event: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Event',
          name: event.title,
          url: `${config.public.siteUrl}/event/${event.slug}`,
          startDate: event.event_date,
          location: {
            '@type': 'Place',
            name: event.location_name,
            address: {
              '@type': 'PostalAddress',
              addressLocality: event.city,
              addressRegion: event.province,
              addressCountry: 'ID',
            },
          },
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          image: event.poster_webp_url || `${config.public.siteUrl}/og-default.webp`,
          description: event.description || `Event lari ${event.title} di ${event.city}`,
        },
      }))
    ),
  }),
])

// Breadcrumbs (Home otomatis ditambahkan oleh komponen Breadcrumb)
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Event', link: '/event' },
  { text: 'Kategori', link: '/event/kategori' },
  { text: categoryName.value, link: null },
])

useBreadcrumbSchema(breadcrumbs)

// Header
const headerBg = computed(() => getImage('header_bg_events', null) ?? undefined)

const { data: eventHeaderBanners } = await useAsyncData(`ad-banners-event-header-category`, () =>
  fetchResponsiveBanners('page_header_event')
)
const headerAdBanners = computed(() => eventHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => eventHeaderBanners.value?.mobile ?? [])
</script>

<template>
  <div>
    <!-- Page Header -->
    <LayoutPageHeader
      :title="`Event ${categoryName} Indonesia`"
      :description="`${totalCount} event ${categoryDesc} terbaru di seluruh Indonesia untuk ${currentYear}.`"
      :breadcrumbs="breadcrumbs"
      :background-image-url="headerBg"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <!-- Main Content -->
    <section class="bg-surface py-10">
      <div class="layout-container">
        <!-- Intro Text untuk SEO -->
        <div class="mb-8 rounded-2xl border border-secondary/30 bg-white p-6">
          <h2 class="text-2xl font-bold text-primary mb-4 font-saira tracking-tight">
            Kalender Event {{ categoryName }} {{ currentYear }}
          </h2>
          <div class="prose prose-sm max-w-none text-gray-600">
            <p>
              <strong>{{ categoryName }}</strong> adalah salah satu kategori event lari paling populer di Indonesia. 
              Temukan jadwal event {{ categoryDesc }} terlengkap untuk tahun {{ currentYear }} di berbagai kota.
            </p>
            <p class="mb-0">
              <strong>{{ totalCount }} event</strong> tersedia untuk kategori ini. 
              Cek jadwal, lokasi, dan cara daftar setiap event di bawah ini. Update setiap hari!
            </p>
          </div>
        </div>

        <!-- Event List -->
        <div v-if="pending && events.length === 0">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <EventCardSkeleton
              v-for="n in 4"
              :key="`skel-${n}`"
            />
          </div>
        </div>
        
        <div v-else-if="events.length > 0">
          <!-- Grid View Only -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 auto-rows-fr">
            <EventCard
              v-for="event in events"
              :key="event.id"
              :event="event"
              tone="white"
              class="h-full"
            />
          </div>
          
          <!-- Load More Button -->
          <div
            v-if="currentPage < lastPage"
            class="mt-10 flex justify-center"
          >
            <UiAppButton
              variant="primary"
              size="md"
              :is-loading="pending"
              @click="loadMore"
            >
              Lihat Lebih Banyak
            </UiAppButton>
          </div>
        </div>
        
        <div
          v-else
          class="text-center py-16 rounded-2xl border border-secondary/20 bg-white"
        >
          <h3 class="text-xl font-semibold text-primary">
            Tidak Ada Event Ditemukan
          </h3>
          <p class="mt-2 text-gray-500">
            Belum ada event untuk kategori ini. Pantau terus untuk update!
          </p>
        </div>

        <!-- Internal Links untuk Silo Structure -->
        <div class="mt-10 rounded-2xl border border-secondary/30 bg-white p-6">
          <h3 class="text-lg font-bold text-primary mb-4 font-saira">
            Jelajahi Event Lain
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NuxtLink
              to="/event"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition"
            >
              <IconHeroiconsMapPin20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
              Lihat Semua Event Lari Indonesia
            </NuxtLink>
            <NuxtLink
              to="/event/kategori"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition"
            >
              <IconHeroiconsTag20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
              Lihat Semua Kategori
            </NuxtLink>
            <NuxtLink
              to="/blog"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition"
            >
              <IconHeroiconsBookOpen20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
              Tips & Panduan Lari
            </NuxtLink>
            <NuxtLink
              to="/ekosistem/komunitas-lari"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition"
            >
              <IconHeroiconsUserGroup20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
              Komunitas Lari Indonesia
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

