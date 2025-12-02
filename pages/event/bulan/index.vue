<script setup lang="ts">
/**
 * Halaman INDEX Bulan - Listing event per bulan
 * 
 * URL: /event/bulan
 * SEO Strategy: Hub page untuk internal linking & breadcrumb hierarchy
 * TIDAK ADA DI NAVIGATION - hanya untuk breadcrumb & sitemap
 */

import { computed, ref, watch } from 'vue'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useAdBanners } from '~/composables/useAdBanners'
import { useEvents } from '~/composables/useEvents'
import { useCurrentYear } from '~/composables/useCurrentYear'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import IconHeroiconsCalendarDays20Solid from '~icons/heroicons/calendar-days-20-solid'
import IconMdiChartDonut from '~icons/mdi/chart-donut'

const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchResponsiveBanners } = useAdBanners()
const { fetchCalendarStats, fetchAvailableEventYears } = useEvents()
const { currentYear: dynamicCurrentYear } = useCurrentYear()

const currentYear = computed(() => dynamicCurrentYear.value)
const selectedYear = ref<number>(currentYear.value)

// Fetch available years
const { data: availableYearsData } = await useAsyncData('event-available-years', async () => {
  const response = await fetchAvailableEventYears()
  return response.years || []
})

// Initial available years (before filtering by events)
const initialAvailableYears = computed<number[]>(() => {
  const years = availableYearsData.value || []
  if (years.length === 0) {
    // Fallback: generate years from 2024 to 2027
    return [2024, 2025, 2026, 2027]
  }
  return years.sort((a, b) => a - b)
})

// Fetch calendar stats untuk semua tahun yang tersedia
const { data: calendarStatsByYear } = await useAsyncData(
  'calendar-stats-by-year-bulan',
  async () => {
    const statsByYear: Record<number, Record<number, number>> = {}
    
    // Fetch semua tahun yang tersedia (bukan hanya 4 tahun terakhir)
    await Promise.all(
      initialAvailableYears.value.map(async (year) => {
        try {
          const response = await fetchCalendarStats(year)
          statsByYear[year] = response?.data || {}
        } catch (error) {
          console.error(`Error fetching calendar stats for year ${year}:`, error)
          statsByYear[year] = {}
        }
      })
    )
    
    return statsByYear
  }
)

// Filter tahun yang memiliki event (tidak kosong)
const yearsWithEvents = computed<number[]>(() => {
  if (!calendarStatsByYear.value) return []
  
  return Object.keys(calendarStatsByYear.value)
    .map(year => Number(year))
    .filter(year => {
      const stats = calendarStatsByYear.value?.[year] || {}
      const totalEvents = Object.values(stats).reduce((sum, count) => sum + count, 0)
      return totalEvents > 0
    })
    .sort((a, b) => a - b)
})

const availableYears = computed<number[]>(() => {
  // Jika sudah ada data calendar stats, gunakan tahun yang memiliki event
  if (yearsWithEvents.value.length > 0) {
    return yearsWithEvents.value
  }
  
  // Fallback: gunakan tahun dari API atau generate default
  return initialAvailableYears.value
})

// Watch untuk set selectedYear ke currentYear jika available
watch(
  [availableYears, currentYear],
  ([years, current]) => {
    if (years.length === 0) {
      selectedYear.value = current
      return
    }
    // Jika tahun yang dipilih tidak ada di daftar tahun yang memiliki event, pindah ke tahun yang tersedia
    if (!years.includes(selectedYear.value)) {
      const firstYear = years[0]
      if (firstYear !== undefined) {
        selectedYear.value = years.includes(current) ? current : firstYear
      }
    }
  },
  { immediate: true },
)

const activeStats = computed<Record<number, number>>(() => {
  return calendarStatsByYear.value?.[selectedYear.value] ?? {}
})

const hasEvents = computed(() => Object.values(activeStats.value).some(count => count > 0))

const totalEventsInYear = computed(() => {
  return Object.values(activeStats.value).reduce((sum, count) => sum + count, 0)
})

const calendarGrid = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1 // 1-12
    const date = new Date(selectedYear.value, i, 1)
    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(date)
    const monthShortName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date)
    const eventCount = activeStats.value[monthNum] || 0
    const monthSlug = `${selectedYear.value}-${String(monthNum).padStart(2, '0')}`
    
    return {
      monthNum,
      monthName,
      monthShortName,
      eventCount,
      monthSlug,
    }
  })
})

const busiestMonth = computed(() => {
  if (!totalEventsInYear.value) return null
  return calendarGrid.value.reduce((busiest, current) => {
    return current.eventCount > busiest.eventCount ? current : busiest
  })
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
        <!-- Calendar Section -->
        <div class="mb-8">
          <div
            class="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-4"
          >
            <div class="max-w-4xl">
              <span class="badge-modern inline-flex items-center gap-2">
                <IconHeroiconsCalendarDays20Solid class="h-4 w-4" />
                Kalender Event Nasional
              </span>
              <h2
                class="mt-4 text-xl font-bold leading-tight tracking-tighter text-primary lg:text-2xl mb-2"
              >
                Pilih Bulan untuk Melihat Event Lari {{ selectedYear }}
              </h2>
              <p class="text-sm leading-relaxed text-gray-600 lg:text-base max-w-xl">
                Rencanakan jadwal lari kamu dengan melihat event yang tersedia setiap bulan.
                Jelajahi jadwal event lari sepanjang tahun {{ selectedYear }}. Temukan event running di
                bulanmu dan catat race favorit untuk persiapan terbaik.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
            <div class="lg:col-span-2">
              <!-- Year Selector - SELALU TAMPIL -->
              <div class="mb-6 rounded-xl border border-secondary/30 bg-white p-4">
                <p class="text-xs font-semibold text-gray-700 mb-3">
                  Tahun
                </p>
                <div class="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  <button
                    v-for="year in availableYears"
                    :key="year"
                    :class="[
                      'py-2 text-sm font-medium rounded-lg transition-colors',
                      selectedYear === year
                        ? 'bg-secondary text-primary'
                        : 'border border-secondary/40 hover:bg-gray-100 text-gray-700',
                    ]"
                    @click="selectedYear = year"
                  >
                    {{ year }}
                  </button>
                </div>
              </div>

              <!-- Month Grid (Calendar Style - 4 columns) -->
              <div
                v-if="hasEvents"
                class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
              >
                <NuxtLink
                  v-for="month in calendarGrid"
                  :key="month.monthSlug"
                  :to="`/event/bulan/${month.monthSlug}`"
                  class="group flex h-full flex-col justify-between rounded-2xl border p-4 transition-colors duration-200"
                  :class="
                    month.eventCount > 0
                      ? 'border-secondary bg-surface'
                      : 'border-gray bg-surface/30'
                  "
                >
                  <div>
                    <p
                      class="text-base font-bold tracking-tighter text-primary"
                      :class="{ 'group-hover:text-primary': month.eventCount > 0 }"
                    >
                      {{ month.monthName }}
                    </p>
                  </div>
                  <p
                    class="mt-3 text-xs font-semibold uppercase tracking-wider"
                    :class="[
                      month.eventCount > 0
                        ? 'text-gray-600 group-hover:text-secondary'
                        : 'text-gray-600',
                    ]"
                  >
                    {{ month.eventCount }} Event
                  </p>
                </NuxtLink>
              </div>

              <!-- Empty State - TAMPIL JIKA TIDAK ADA EVENT -->
              <div
                v-else
                class="rounded-2xl border border-dashed border-secondary/40 bg-surface px-6 py-10 text-center text-gray-600"
              >
                <IconHeroiconsCalendarDays20Solid class="mx-auto h-10 w-10 text-gray-500" />
                <p class="mt-4 text-base font-medium">
                  Belum ada event terjadwal untuk tahun {{ selectedYear }}.
                </p>
                <p class="mt-1 text-sm">
                  Pantau terus halaman ini, kami akan update segera setelah jadwal terbaru dirilis.
                </p>
              </div>
            </div>
            <div class="lg:col-span-1">
              <div
                class="sticky top-24 flex h-full flex-col rounded-2xl border border-secondary bg-surface p-4"
              >
                <h3 class="flex items-center gap-3 text-lg font-bold text-primary">
                  <IconMdiChartDonut class="h-6 w-6 text-secondary" />
                  Statistik {{ selectedYear }}
                </h3>
                <div class="mt-4 space-y-4">
                  <div
                    class="flex items-center justify-between rounded-xl border border-secondary bg-white p-4"
                  >
                    <p class="text-sm font-medium text-gray-600">
                      Total Event
                    </p>
                    <p class="text-xl font-bold text-primary">
                      {{ totalEventsInYear }}
                    </p>
                  </div>
                  <div
                    v-if="busiestMonth && busiestMonth.eventCount > 0"
                    class="flex items-center justify-between rounded-xl border border-secondary bg-white p-4"
                  >
                    <p class="text-sm font-medium text-gray-600">
                      Bulan Terpadat
                    </p>
                    <p class="text-right text-base font-bold text-primary">
                      {{ busiestMonth.monthName }}
                      <span class="block text-xs font-normal text-gray-500">{{ busiestMonth.eventCount }} event</span>
                    </p>
                  </div>
                </div>
                <div class="mt-auto pt-4 text-center">
                  <p class="text-xs leading-relaxed text-gray-500">
                    Gunakan kalender ini sebagai panduan untuk merencanakan musim larimu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

