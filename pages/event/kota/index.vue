<script setup lang="ts">
/**
 * Halaman INDEX Kota - Listing semua kota/kabupaten yang punya event
 * 
 * URL: /event/kota
 * SEO Strategy: Hub page untuk internal linking & breadcrumb hierarchy
 * TIDAK ADA DI NAVIGATION - hanya untuk breadcrumb & sitemap
 */

import { computed } from 'vue'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSchemaOrg, defineWebPage } from '#imports'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useCities } from '~/composables/useCities'
import { useAdBanners } from '~/composables/useAdBanners'
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import IconHeroiconsMapPin20Solid from '~icons/heroicons/map-pin-20-solid'

const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchCities } = useCities()
const { fetchResponsiveBanners } = useAdBanners()

// Fetch cities with events
const { data: citiesData } = await useAsyncData('cities-with-events', () => fetchCities())

const cities = computed(() => citiesData.value?.data ?? [])

// SEO
const currentYear = new Date().getFullYear()
const seoTitle = `Jadwal Lari per Kota ${currentYear} - Event Running di Seluruh Indonesia`
const seoDescription = `Jelajahi ${cities.value.length}+ kota/kabupaten di Indonesia yang menyelenggarakan event lari ${currentYear}. Temukan event terdekat di kotamu!`

useSeoMetaDynamic({
  title: seoTitle,
  description: seoDescription,
  url: '/event/kota',
  type: 'website',
})

// Schema.org
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/event/kota`,
    name: seoTitle,
    description: seoDescription,
    '@type': 'CollectionPage',
  }),
])

// Breadcrumbs (Home otomatis ditambahkan oleh komponen Breadcrumb)
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Event', link: '/event' },
  { text: 'Kota', link: '/event/kota' },
])

useBreadcrumbSchema(breadcrumbs)

// Header
const headerBg = computed(() => getImage('header_bg_events', null) ?? undefined)
const { data: eventHeaderBanners } = await useAsyncData('ad-banners-event-header-kota', () =>
  fetchResponsiveBanners('page_header_event')
)
const headerAdBanners = computed(() => eventHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => eventHeaderBanners.value?.mobile ?? [])
</script>

<template>
  <div>
    <!-- Page Header -->
    <LayoutPageHeader
      title="Event Lari per Kota"
      :description="`Jelajahi ${cities.length} kota/kabupaten yang menyelenggarakan event lari di Indonesia`"
      :breadcrumbs="breadcrumbs"
      :background-image-url="headerBg"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <!-- Main Content -->
    <section class="bg-surface py-10">
      <div class="layout-container">
        <!-- Intro -->
        <div class="mb-8 text-center max-w-3xl mx-auto">
          <h2 class="text-2xl font-bold text-primary mb-3 font-saira tracking-tight">
            Pilih Kota untuk Melihat Event Lari
          </h2>
          <p class="text-gray-600">
            Temukan jadwal event lari terdekat di kota atau kabupaten favoritmu.
          </p>
        </div>

        <!-- City Grid (Styling seperti ProvinceSection) -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <NuxtLink
            v-for="(city, index) in cities"
            :key="index"
            :to="`/event/kota/${city.city.toLowerCase().replace(/\s+/g, '-')}`"
            class="group relative h-64 overflow-hidden rounded-2xl bg-primary"
          >
            <!-- Fallback gradient (cities don't have images) -->
            <div
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-black text-center text-white"
            >
              <IconHeroiconsMapPin20Solid class="h-12 w-12 mb-2 opacity-50" />
              <span class="text-lg font-semibold tracking-tight">{{ city.city }}</span>
            </div>
            
            <!-- Overlay gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-transparent" />
            
            <!-- Content -->
            <div class="absolute inset-0 flex flex-col justify-between p-5 text-white">
              <span class="badge-modern inline-flex items-center gap-2 self-start">
                <IconHeroiconsMapPin20Solid class="h-4 w-4" />
                {{ city.province }}
              </span>
              <div>
                <h2 class="text-xl font-semibold tracking-tight">
                  {{ city.city }}
                </h2>
                <p class="text-sm text-white/80">
                  {{ city.event_count || 0 }} event tersedia
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty State -->
        <div
          v-if="cities.length === 0"
          class="text-center py-16 text-gray-500"
        >
          <p>Belum ada data kota dengan event aktif.</p>
        </div>
      </div>
    </section>
  </div>
</template>

