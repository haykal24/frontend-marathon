<script setup lang="ts">
/**
 * Halaman INDEX Provinsi - Listing semua provinsi yang punya event
 * 
 * URL: /event/provinsi
 * SEO Strategy: Hub page untuk internal linking & breadcrumb hierarchy
 * TIDAK ADA DI NAVIGATION - hanya untuk breadcrumb & sitemap
 */

import { computed } from 'vue'
import { useImage } from '#imports'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useProvinces } from '~/composables/useProvinces'
import { useAdBanners } from '~/composables/useAdBanners'
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { Province } from '~/types/event'
// IconHeroiconsMapPin20Solid imported but not used
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'

const $img = useImage()

const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchActiveProvinces } = useProvinces()
const { fetchResponsiveBanners } = useAdBanners()

// Fetch provinces with events
const { data: provincesData } = await useAsyncData('provinces-with-events', () => fetchActiveProvinces())
const provinces = computed<Province[]>(() => provincesData.value?.data ?? [])

// SEO
const currentYear = new Date().getFullYear()
const seoTitle = `Jadwal Lari per Provinsi ${currentYear} - Event Running di Seluruh Indonesia`
const seoDescription = `Jelajahi ${provinces.value.length}+ provinsi di Indonesia yang menyelenggarakan event lari ${currentYear}. Temukan marathon, fun run, dan trail running di provinsi favoritmu.`

useSeoMetaDynamic({
  title: seoTitle,
  description: seoDescription,
  url: '/event/provinsi',
  type: 'website',
})

// Schema.org: CollectionPage
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/event/provinsi`,
    name: seoTitle,
    description: seoDescription,
    '@type': 'CollectionPage',
  }),
])

// Breadcrumbs (Home otomatis ditambahkan oleh komponen Breadcrumb)
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Event', link: '/event' },
  { text: 'Provinsi', link: '/event/provinsi' },
])

useBreadcrumbSchema(breadcrumbs)

// Build image URL for province
const buildProvinceImage = (src?: string | null) => {
  if (!src) return ''
  return $img(src, {
    width: 1200,
    height: 800,
    format: 'webp',
    quality: 80,
  })
}

// Header
const headerBg = computed(() => getImage('header_bg_events', null) ?? undefined)
const { data: eventHeaderBanners } = await useAsyncData('ad-banners-event-header-provinsi', () =>
  fetchResponsiveBanners('page_header_event')
)
const headerAdBanners = computed(() => eventHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => eventHeaderBanners.value?.mobile ?? [])
</script>

<template>
  <div>
    <!-- Page Header -->
    <LayoutPageHeader
      title="Event Lari per Provinsi"
      :description="`Jelajahi ${provinces.length} provinsi yang menyelenggarakan event lari di Indonesia`"
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
            Pilih Provinsi untuk Melihat Event Lari
          </h2>
          <p class="text-gray-600">
            Dari Aceh hingga Papua, temukan jadwal event lari terlengkap di setiap provinsi Indonesia.
          </p>
        </div>

        <!-- Province Grid (Styling seperti ProvinceSection) -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <NuxtLink
            v-for="province in provinces"
            :key="province.id"
            :to="`/event/provinsi/${province.slug}`"
            class="group relative h-64 overflow-hidden rounded-2xl bg-primary"
          >
            <!-- Image -->
            <img
              v-if="province.thumbnail"
              :src="buildProvinceImage(province.thumbnail)"
              :alt="province.name"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              width="1200"
              height="800"
            >
            <!-- Fallback gradient -->
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-black text-center text-white"
            >
              <span class="text-lg font-semibold tracking-tight">{{ province.name }}</span>
            </div>
            
            <!-- Overlay gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-transparent" />
            
            <!-- Content -->
            <div class="absolute inset-0 flex flex-col justify-between p-5 text-white">
              <span class="badge-modern inline-flex items-center gap-2 self-start">
                <IconHeroiconsSparkles20Solid class="h-4 w-4" />
                Favorit
              </span>
              <div>
                <h2 class="text-xl font-semibold tracking-tight">
                  {{ province.name }}
                </h2>
                <p class="text-sm text-white/80">
                  {{ province.event_count ?? 0 }} event tersedia
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty State -->
        <div
          v-if="provinces.length === 0"
          class="text-center py-16 text-gray-500"
        >
          <p>Belum ada data provinsi dengan event aktif.</p>
        </div>
      </div>
    </section>
  </div>
</template>

