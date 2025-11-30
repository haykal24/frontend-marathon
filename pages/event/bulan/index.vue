<script setup lang="ts">
/**
 * Halaman INDEX Bulan - Listing event per bulan
 * 
 * URL: /event/bulan
 * SEO Strategy: Hub page untuk internal linking & breadcrumb hierarchy
 * TIDAK ADA DI NAVIGATION - hanya untuk breadcrumb & sitemap
 */

import { computed } from 'vue'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useAdBanners } from '~/composables/useAdBanners'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
// IconHeroiconsCalendarDays20Solid imported but not used

const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchResponsiveBanners } = useAdBanners()

// Generate months (current year + next year)
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

const months = computed(() => {
  const monthList = []
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  // Generate dari bulan sekarang hingga 12 bulan ke depan
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 1 + i) % 12
    const year = currentYear + Math.floor((currentMonth - 1 + i) / 12)
    const monthNum = monthIndex + 1

    monthList.push({
      year,
      month: monthNum,
      monthName: monthNames[monthIndex],
      slug: `${year}-${String(monthNum).padStart(2, '0')}`,
      label: `${monthNames[monthIndex]} ${year}`,
    })
  }

  return monthList
})

// SEO
const seoTitle = `Jadwal Lari per Bulan ${currentYear} - Kalender Event Running Indonesia`
const seoDescription = `Lihat jadwal event lari bulanan di Indonesia. Rencanakan partisipasi event marathon, fun run, dan trail running favoritmu setiap bulan.`

useSeoMetaDynamic({
  title: seoTitle,
  description: seoDescription,
  url: '/event/bulan',
  type: 'website',
})

// Schema.org
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/event/bulan`,
    name: seoTitle,
    description: seoDescription,
    '@type': 'CollectionPage',
  }),
])

// Breadcrumbs (Home otomatis ditambahkan oleh komponen Breadcrumb)
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Event', link: '/event' },
  { text: 'Bulan', link: '/event/bulan' },
])

useBreadcrumbSchema(breadcrumbs)

// Header
const headerBg = computed(() => getImage('header_bg_events', null) ?? undefined)
const { data: eventHeaderBanners } = await useAsyncData('ad-banners-event-header-bulan', () =>
  fetchResponsiveBanners('page_header_event')
)
const headerAdBanners = computed(() => eventHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => eventHeaderBanners.value?.mobile ?? [])
</script>

<template>
  <div>
    <!-- Page Header -->
    <LayoutPageHeader
      title="Event Lari per Bulan"
      description="Jelajahi jadwal event lari berdasarkan bulan untuk merencanakan partisipasimu"
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
            Pilih Bulan untuk Melihat Event Lari
          </h2>
          <p class="text-gray-600">
            Rencanakan jadwal lari kamu dengan melihat event yang tersedia setiap bulan.
          </p>
        </div>

        <!-- Calendar Section (mirip dengan event index month picker) -->
        <div class="rounded-2xl border border-secondary/30 bg-white p-6">
          <!-- Year Selector -->
          <div class="mb-6">
            <p class="text-xs font-semibold text-gray-700 mb-2">
              Tahun
            </p>
            <div class="grid grid-cols-5 gap-2">
              <div
                v-for="year in [currentYear - 1, currentYear, currentYear + 1, currentYear + 2]"
                :key="year"
                :class="[
                  'w-full rounded-md py-2 text-sm font-medium transition-colors text-center',
                  year === currentYear
                    ? 'bg-secondary text-primary'
                    : 'border border-secondary/40 hover:bg-gray-100 text-gray-700',
                ]"
              >
                {{ year }}
              </div>
            </div>
          </div>

          <!-- Month Grid (Calendar Style - 4 columns seperti di event index) -->
          <div>
            <p class="text-xs font-semibold text-gray-700 mb-2">
              Bulan
            </p>
            <div class="grid grid-cols-4 gap-2">
              <NuxtLink
                v-for="month in months"
                :key="month.slug"
                :to="`/event/bulan/${month.slug}`"
                :class="[
                  'w-full rounded-md py-2 px-1 text-xs font-medium transition-colors text-center',
                  'hover:bg-secondary/10 border border-secondary/30',
                ]"
                :title="month.label"
              >
                {{ month.monthName?.slice(0, 3) || '' }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

