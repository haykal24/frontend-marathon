<script setup lang="ts">
/**
 * Halaman Landing Page Dinamis - Event berdasarkan Bulan
 * 
 * URL: /event/bulan/2025-01
 * SEO Strategy: Programmatic SEO untuk ranking keyword temporal
 * TIDAK ADA DI NAVIGATION - hanya untuk breadcrumb & sitemap
 */

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useEvents } from '~/composables/useEvents'
import { useAdBanners } from '~/composables/useAdBanners'
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { Event } from '~/types/event'
import IconHeroiconsMapPin20Solid from '~icons/heroicons/map-pin-20-solid'
import IconHeroiconsCalendarDays20Solid from '~icons/heroicons/calendar-days-20-solid'
import IconHeroiconsBookOpen20Solid from '~icons/heroicons/book-open-20-solid'
import IconHeroiconsUserGroup20Solid from '~icons/heroicons/user-group-20-solid'
import IconMdiViewGrid from '~icons/mdi/view-grid'
import IconMdiViewList from '~icons/mdi/view-list'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'
import EventCard from '~/components/event/EventCard.vue'
// EventCardSkeleton imported but not used in this file
import { formatEventMeta, formatEventDateRange } from '~/utils/format'
import { ref } from 'vue'

const route = useRoute()
const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchEvents } = useEvents()
const { fetchResponsiveBanners } = useAdBanners()

const bulanSlug = route.params.slug as string // Format: 2025-01

// Parse year dan month dari slug
const [year, month] = bulanSlug.split('-').map(Number)
const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const bulanName = (month && month > 0 && month <= 12) ? monthNames[month - 1] || 'Bulan' : 'Bulan'

// Fetch events for this month
const { data: eventsData } = await useAsyncData(
  `events-month-${bulanSlug}`,
  async () => {
    return await fetchEvents({
      month: bulanSlug,
      per_page: 50,
      order_by: 'event_date',
      order: 'asc',
    })
  }
)

const events = computed<Event[]>(() => eventsData.value?.data ?? [])
const totalEvents = computed(() => eventsData.value?.meta?.pagination?.total ?? 0)

// SEO: Dynamic title dan description
const seoTitle = computed(() => 
  `Jadwal Lari ${bulanName} ${year} - Event Marathon Indonesia`
)
const seoDescription = computed(() => 
  `Temukan ${totalEvents.value}+ jadwal event lari untuk bulan ${bulanName} ${year}. Rencanakan partisipasi marathon, fun run, dan trail running favoritmu!`
)

useSeoMetaDynamic({
  title: seoTitle.value,
  description: seoDescription.value,
  url: `/event/bulan/${bulanSlug}`,
  type: 'website',
})

// Schema.org: CollectionPage
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/event/bulan/${bulanSlug}`,
    name: seoTitle.value,
    description: seoDescription.value,
    '@type': 'CollectionPage',
  }),
  // ItemList untuk SEO
  defineItemList({
    itemListElement: computed(() =>
      events.value.slice(0, 20).map((event, index) => ({
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
          description: event.description || `Event lari ${event.title}`,
        },
      }))
    ),
  }),
])

// Breadcrumbs (Home otomatis ditambahkan oleh komponen Breadcrumb)
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Event', link: '/event' },
  { text: 'Bulan', link: '/event/bulan' },
  { text: `${bulanName} ${year}`, link: null },
])

useBreadcrumbSchema(breadcrumbs)

// Header
const headerBg = computed(() => getImage('header_bg_events', null) ?? undefined)

const { data: eventHeaderBanners } = await useAsyncData(`ad-banners-event-header-month`, () =>
  fetchResponsiveBanners('page_header_event')
)
const headerAdBanners = computed(() => eventHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => eventHeaderBanners.value?.mobile ?? [])

// View mode (Grid/Table toggle)
const viewMode = ref<'grid' | 'table'>('grid')
</script>

<template>
  <div>
    <!-- Page Header -->
    <LayoutPageHeader
      :title="`Event Lari ${bulanName} ${year}`"
      :description="`${totalEvents} event lari di bulan ${bulanName} ${year}.`"
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
            Kalender Event Lari {{ bulanName }} {{ year }}
          </h2>
          <div class="prose prose-sm max-w-none text-gray-600">
            <p>
              Temukan jadwal event lari yang diadakan pada bulan <strong>{{ bulanName }} {{ year }}</strong>. 
              Rencanakan partisipasi kamu di marathon, fun run, atau trail running favoritmu!
            </p>
            <p class="mb-0">
              <strong>{{ totalEvents }} event</strong> tersedia untuk bulan ini. 
              Cek jadwal, lokasi, dan cara daftar setiap event di bawah ini.
            </p>
          </div>
        </div>

        <!-- View Toggle -->
        <div class="mb-6 flex items-center justify-between rounded-xl border border-secondary/30 bg-white p-3">
          <div class="text-sm text-gray-600">
            <span>Total</span>
            <span class="font-semibold text-primary ml-2">{{ totalEvents }}</span>
            <span class="ml-1">event</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              :class="[
                'p-2 rounded-lg transition',
                viewMode === 'grid'
                  ? 'bg-secondary text-primary'
                  : 'border border-secondary/40 text-gray-500 hover:border-secondary/60',
              ]"
              @click="viewMode = 'grid'"
            >
              <IconMdiViewGrid class="h-5 w-5" />
            </button>
            <button
              :class="[
                'p-2 rounded-lg transition',
                viewMode === 'table'
                  ? 'bg-secondary text-primary'
                  : 'border border-secondary/40 text-gray-500 hover:border-secondary/60',
              ]"
              @click="viewMode = 'table'"
            >
              <IconMdiViewList class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Event List -->
        <div v-if="events.length > 0">
          <!-- Grid View -->
          <div
            v-if="viewMode === 'grid'"
            class="grid grid-cols-1 sm:grid-cols-2 gap-6 auto-rows-fr"
          >
            <EventCard
              v-for="event in events"
              :key="event.id"
              :event="event"
              tone="white"
              class="h-full"
            />
          </div>
          
          <!-- Table View -->
          <div
            v-else
            class="overflow-x-auto rounded-2xl border border-secondary/20 bg-white shadow-sm"
          >
            <table class="w-full text-sm text-left text-gray-600">
              <thead class="bg-gray-100 text-xs font-semibold uppercase tracking-wider text-primary">
                <tr>
                  <th
                    scope="col"
                    class="px-4 sm:px-6 py-4 font-bold text-primary text-xs"
                  >
                    Tanggal
                  </th>
                  <th
                    scope="col"
                    class="px-4 sm:px-6 py-4 font-bold text-primary text-xs min-w-60"
                  >
                    Nama Event
                  </th>
                  <th
                    scope="col"
                    class="px-4 sm:px-6 py-4 font-bold text-primary text-xs min-w-48"
                  >
                    Lokasi
                  </th>
                  <th
                    scope="col"
                    class="px-4 sm:px-6 py-4 font-bold text-primary text-xs min-w-40"
                  >
                    Kategori
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-secondary/20">
                <tr
                  v-for="event in events"
                  :key="event.id"
                  class="hover:bg-secondary/5 transition-colors cursor-pointer"
                  @click="navigateTo(`/event/${event.slug}`)"
                >
                  <td class="px-4 sm:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {{ formatEventDateRange(event.event_date, event.event_end_date) }}
                  </td>
                  <td class="px-4 sm:px-6 py-4">
                    <div class="flex items-center gap-2">
                      <IconHeroiconsSparkles20Solid
                        v-if="event.is_featured_hero"
                        class="h-4 w-4 text-secondary"
                      />
                      <span class="font-semibold text-primary">{{ event.title }}</span>
                    </div>
                  </td>
                  <td class="px-4 sm:px-6 py-4 text-gray-600">
                    <div class="flex flex-col gap-0.5">
                      <span class="font-medium text-gray-900">{{ event.city }}</span>
                      <span class="text-xs">{{ event.province }}</span>
                    </div>
                  </td>
                  <td class="px-4 sm:px-6 py-4">
                    <span class="text-sm font-medium text-gray-900">
                      {{ formatEventMeta(event) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
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
            Belum ada event untuk bulan ini. Pantau terus untuk update!
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
              to="/event/bulan"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition"
            >
              <IconHeroiconsCalendarDays20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
              Lihat Kalender Bulanan
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

