<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useCurrentYear } from '~/composables/useCurrentYear'
import { useAdBanners } from '~/composables/useAdBanners'
import { useEventListing, type EventFilterState } from '~/composables/useEventListing'
import { useActiveProvinces } from '~/composables/useActiveProvinces'
import { useEventFilters } from '~/composables/useEventFilters'
import IconMdiMagnify from '~icons/mdi/magnify'
import IconMdiViewGrid from '~icons/mdi/view-grid'
import IconMdiViewList from '~icons/mdi/view-list'
import IconMdiChevronDown from '~icons/mdi/chevron-down'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import EventCard from '~/components/event/EventCard.vue'
import EventCardSkeleton from '~/components/event/EventCardSkeleton.vue'
import AppFilterDropdown from '~/components/ui/AppFilterDropdown.vue'
import PageHeader from '~/components/layout/PageHeader.vue'
import { formatEventMeta, formatEventDateRange } from '~/utils/format'

const { currentYear } = useCurrentYear()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

// --- SEO Meta & Canonical ---
const canonicalUrl = computed(() => {
  // Ambil full path dengan query params untuk canonical yang akurat
  // Google menganggap /event?province=bali sebagai halaman unik
  const path = route.path
  const query = route.query
  
  // Filter query params yang relevan untuk canonical
  const canonicalParams = new URLSearchParams()
  const allowedParams = ['province', 'category', 'month', 'year', 'type', 'page']
  
  Object.entries(query).forEach(([key, value]) => {
    if (allowedParams.includes(key) && value) {
      canonicalParams.append(key, String(value))
    }
  })
  
  const queryString = canonicalParams.toString()
  return queryString ? `${path}?${queryString}` : path
})

useSeoMetaDynamic({
  title: `Jadwal Event Lari ${currentYear.value} - Kalender Event Lari Indonesia`,
  description:
    'Temukan jadwal lengkap event lari di seluruh Indonesia. Kalender lari terbaru untuk road run, trail run, fun run, dan marathon.',
  url: canonicalUrl, // FIX: Canonical URL harus menyertakan filter
})

// SEO: OG Image menggunakan fallback og.webp (tidak perlu defineOgImage untuk listing)

// --- Breadcrumb Items ---
const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [
    { text: 'Jadwal Lari', link: null }, // Current page
  ]
  return items
})

// SEO: BreadcrumbList Schema.org untuk rich results
useBreadcrumbSchema(breadcrumbItems)

// --- Composables ---
const { getImage } = useSiteSettings()
const { fetchResponsiveBanners } = useAdBanners()
const { provinces, refreshProvinces } = await useActiveProvinces()

const headerBg = computed(() => getImage('header_bg_events', null) ?? undefined)

const { data: eventHeaderBanners } = await useAsyncData('ad-banners-page-header-events', () =>
  fetchResponsiveBanners('page_header_events')
)
const headerAdBanners = computed(() => eventHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => eventHeaderBanners.value?.mobile ?? [])

// --- State (continued) ---
const viewMode = ref<'grid' | 'table'>('grid')
const showMobileFilter = ref(false)
const activeFilterTab = ref<'search' | 'month' | 'province' | 'sort'>('search')

const createDefaultFilters = (): EventFilterState => ({
  search: '',
  month: '',
  province: [] as string[], // Multiple select
  type: [] as string[], // Multiple select (kept for deep-link compatibility)
  sort: 'latest',
  year: '',
})

const filters = ref<EventFilterState>(createDefaultFilters())

initializeFiltersFromQuery()

const {
  events,
  pending,
  currentPage,
  lastPage,
  totalCount,
  loadMore,
} = useEventListing(filters)

// --- CollectionPage & ItemList Schema.org (SEO Optimal) ---
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}${canonicalUrl.value}`,
    name: `Kalender Event Lari ${currentYear.value}`,
    description:
      'Jadwal lengkap event lari di seluruh Indonesia. Filter berdasarkan kategori, lokasi, dan tanggal.',
    url: `${config.public.siteUrl}${canonicalUrl.value}`,
    '@type': 'CollectionPage',
  }),
  // OPTIMASI: Tambahkan ItemList untuk memberitahu Google konten dari koleksi ini
  defineItemList({
    itemListElement: computed(() =>
      events.value.slice(0, 10).map((event, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Event',
          name: event.title,
          url: `${config.public.siteUrl}/event/${event.slug}`,
          startDate: event.event_date,
        },
      }))
    ),
  }),
])

const sortOptions = [
  { value: 'latest', label: 'Terbaru' },
  { value: 'featured', label: 'Event Pilihan' },
]

const {
  selectedYear,
  availableYears,
  monthOptions,
  handleYearSelect,
  handleMonthSelect,
} = useEventFilters(filters)

// --- Computed Options for Filters ---
const provinceOptions = computed(() => {
  const provs = provinces.value || []
  return provs
    .map(p => {
      if (!p.slug || !p.name) return null
      return { value: p.slug, label: p.name }
    })
    .filter(Boolean) as Array<{ value: string; label: string }>
})
// --- Pagination SEO Links ---
function updatePaginationLinks() {
  // Only run on client-side to avoid SSR errors
  if (process.server) return
  
  const baseUrl = route.path
  // Use route.query instead of window.location for SSR compatibility
  const queryParams = new URLSearchParams()
  
  // Copy existing query params (except page)
  Object.entries(route.query).forEach(([key, value]) => {
    if (key !== 'page' && value) {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, String(v)))
      } else {
        queryParams.append(key, String(value))
      }
    }
  })
  
  const links: { rel: string; href: string }[] = []

  if (currentPage.value > 1) {
    const prevParams = new URLSearchParams(queryParams)
    if (currentPage.value === 2) {
      prevParams.delete('page')
    } else {
      prevParams.set('page', String(currentPage.value - 1))
    }
    links.push({
      rel: 'prev',
      href: `${baseUrl}${prevParams.toString() ? '?' + prevParams.toString() : ''}`,
    })
  }

  if (currentPage.value < lastPage.value) {
    const nextParams = new URLSearchParams(queryParams)
    nextParams.set('page', String(currentPage.value + 1))
    links.push({
      rel: 'next',
      href: `${baseUrl}?${nextParams.toString()}`,
    })
  }

  if (links.length > 0) {
    useHead({
      link: links,
    })
  }
}

// --- Watchers & Computed ---
const hasMorePages = computed(() => currentPage.value < lastPage.value)

function resetFilters() {
  filters.value = createDefaultFilters()
  // Clear URL query params
  router.push({ path: '/event' })
}

function initializeFiltersFromQuery(query = route.query) {
  const nextFilters = createDefaultFilters()
  let derivedYear: number | null = null

  // Type filter (deep link compatibility)
  if (query.type) {
    const typeValue = Array.isArray(query.type) ? query.type[0] : query.type || ''
    if (typeValue) nextFilters.type = [typeValue]
  }

  // Province filter
  if (query.province) {
    const provinceValue = Array.isArray(query.province) ? query.province[0] : query.province || ''
    if (provinceValue) nextFilters.province = [provinceValue]
  }

  // Month filter (prioritized to sync year automatically)
  if (query.month) {
    const monthValue = Array.isArray(query.month) ? query.month[0] : query.month || ''
    if (monthValue) {
      nextFilters.month = monthValue
      const monthYear = Number(monthValue.split('-')[0])
      if (!Number.isNaN(monthYear)) {
        derivedYear = monthYear
        nextFilters.year = String(monthYear)
      }
    }
  }

  // Year-only filter
  if (!derivedYear && query.year) {
    const yearValue = Array.isArray(query.year) ? query.year[0] : query.year || ''
    if (yearValue && /^\d{4}$/.test(yearValue)) {
      derivedYear = Number(yearValue)
      nextFilters.year = yearValue
    }
  }

  // Search filter
  if (query.search) {
    const searchValue = Array.isArray(query.search) ? query.search[0] : query.search || ''
    if (searchValue) nextFilters.search = searchValue
  }

  // Sort filter
  if (query.sort) {
    const sortValue = Array.isArray(query.sort) ? query.sort[0] : query.sort || ''
    if (sortValue && ['latest', 'featured'].includes(sortValue)) {
      nextFilters.sort = sortValue as 'latest' | 'featured'
    }
  }

  filters.value = nextFilters
}

watch(
  [currentPage, lastPage],
  () => {
    updatePaginationLinks()
  },
  { immediate: true }
)

watch(
  () => route.fullPath,
  () => {
    initializeFiltersFromQuery()
  }
)

onMounted(() => {
  // Refresh provinces if empty (fallback for client-side)
  // This handles cases where SSR didn't load the data or API failed
  if (provinces.value.length === 0) {
    refreshProvinces()
  }
})
</script>

<template>
  <div class="bg-surface">
    <!-- Page Header (Breadcrumb + Heading Unified) -->
    <PageHeader
      :title="`Kalender Event Lari ${currentYear}`"
      description="Jelajahi jadwal lari terlengkap. Gunakan filter untuk menemukan event road run, trail run, atau fun run berikutnya di kotamu."
      :breadcrumbs="breadcrumbItems"
      :background-image-url="headerBg"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <div class="layout-container py-10">
      <!-- Filter Section - Desktop Only -->
      <div
        class="hidden lg:block mb-8 rounded-2xl border border-secondary/40 bg-white p-4 lg:p-6 shadow-sm"
      >
        <div class="flex flex-col lg:flex-row gap-4 items-center lg:items-end">
          <div class="grid flex-grow grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-3 w-full">
            <!-- Search Input -->
            <div class="relative lg:col-span-3">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Cari nama event..."
                class="w-full rounded-lg border border-secondary/60 bg-white py-2.5 pl-10 pr-4 h-10 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 sm:text-sm"
              >
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <IconMdiMagnify class="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <!-- Month & Year Filter Popover -->
            <div class="lg:col-span-2 relative w-full">
              <Popover
                v-slot="{ close }"
                class="relative w-full"
              >
                <PopoverButton
                  :class="[
                    'relative w-full cursor-default rounded-lg border border-secondary/60 bg-white py-2.5 pl-3 pr-10 text-left h-10 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 sm:text-sm',
                    filters.month ? 'text-primary' : 'text-gray-500',
                  ]"
                >
                  <span class="block truncate">
                    <template v-if="filters.month">
                      {{
                        monthOptions.find(m => m.value === filters.month)?.label
                          ? `${monthOptions.find(m => m.value === filters.month)?.label} ${filters.month.slice(0, 4)}`
                          : 'Bulan'
                      }}
                    </template>
                    <template v-else-if="filters.year">
                      Tahun {{ filters.year }}
                    </template>
                    <template v-else>
                      Bulan/Tahun
                    </template>
                  </span>
                  <span
                    class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                  >
                    <IconMdiChevronDown class="h-5 w-5 text-gray-400" />
                  </span>
                </PopoverButton>
                <transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="translate-y-1 opacity-0"
                  enter-to-class="translate-y-0 opacity-100"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="translate-y-0 opacity-100"
                  leave-to-class="translate-y-1 opacity-0"
                >
                  <PopoverPanel
                    class="absolute z-50 left-0 mt-2 w-96 transform bg-white rounded-lg shadow-lg ring-1 ring-secondary/40 overflow-hidden"
                  >
                    <div class="p-4 space-y-4">
                      <!-- Year Selector -->
                      <div>
                        <p class="text-xs font-semibold text-gray-700 mb-2">
                          Tahun
                        </p>
                        <div class="grid grid-cols-5 gap-2">
                          <button
                            v-for="year in availableYears"
                            :key="year"
                            :class="[
                              'w-full rounded-md py-2 text-sm font-medium transition-colors',
                              (filters.year ? Number(filters.year) === year : selectedYear === year)
                                ? 'bg-secondary text-primary'
                                : 'border border-secondary/40 hover:bg-gray-100',
                            ]"
                            @click="handleYearSelect(year)"
                          >
                            {{ year }}
                          </button>
                        </div>
                      </div>

                      <!-- Month Selector -->
                      <div>
                        <p class="text-xs font-semibold text-gray-700 mb-2">
                          Bulan
                        </p>
                        <div class="grid grid-cols-4 gap-2">
                          <button
                            v-for="month in monthOptions"
                            :key="month.value"
                            :class="[
                              'w-full rounded-md py-2 px-1 text-xs font-medium transition-colors',
                              filters.month === month.value
                                ? 'bg-secondary text-primary'
                                : 'hover:bg-gray-100',
                            ]"
                            :title="month.label"
                            @click="handleMonthSelect(month.value, close)"
                          >
                            {{ month.label.slice(0, 3) }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </PopoverPanel>
                </transition>
              </Popover>
            </div>

            <!-- Province Filter -->
            <div class="lg:col-span-2">
              <AppFilterDropdown
                v-model="filters.province"
                :options="provinceOptions"
                placeholder="Provinsi"
                multiple
              />
            </div>

            <!-- Sort Filter -->
            <div class="lg:col-span-1">
              <AppFilterDropdown
                v-model="filters.sort"
                :options="sortOptions"
                placeholder="Urutkan"
              />
            </div>
          </div>

          <!-- Reset Button (X icon) -->
          <button
            class="h-10 w-10 rounded-lg border border-secondary/40 bg-white text-primary hover:bg-secondary/5 transition-colors flex items-center justify-center flex-shrink-0"
            :title="`${Object.values(filters).some(v => v && v !== 'latest') ? 'Reset semua filter' : 'Tidak ada filter aktif'}`"
            @click="resetFilters"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- View Switcher -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              :class="[
                'p-2.5 rounded-lg transition h-10 w-10 flex items-center justify-center',
                viewMode === 'grid'
                  ? 'bg-secondary text-primary'
                  : 'border border-secondary/40 text-gray-500 hover:border-secondary/60',
              ]"
              aria-label="Grid View"
              title="Tampilan Grid"
              @click="viewMode = 'grid'"
            >
              <IconMdiViewGrid class="h-5 w-5" />
            </button>
            <button
              :class="[
                'p-2.5 rounded-lg transition h-10 w-10 flex items-center justify-center',
                viewMode === 'table'
                  ? 'bg-secondary text-primary'
                  : 'border border-secondary/40 text-gray-500 hover:border-secondary/60',
              ]"
              aria-label="Table View"
              title="Tampilan Tabel"
              @click="viewMode = 'table'"
            >
              <IconMdiViewList class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Desktop Event Count Info (Below Filter) -->
        <div
          v-if="totalCount > 0 || !pending"
          class="hidden lg:flex items-center justify-between pt-4 mt-4 border-t border-secondary/10"
        >
          <div class="text-sm text-gray-600">
            <span>Total</span>
            <span class="font-semibold text-primary ml-2">{{ totalCount }}</span>
            <span class="ml-1">event</span>
          </div>
          <div
            v-if="lastPage > 1"
            class="text-sm text-gray-500"
          >
            Halaman <span class="font-medium text-primary">{{ currentPage }}</span> dari
            <span class="font-medium text-primary">{{ lastPage }}</span>
          </div>
        </div>
      </div>

      <!-- Mobile: Event Count Info + View Toggle -->
      <div
        v-if="totalCount > 0 || !pending"
        class="lg:hidden mb-4 rounded-2xl border border-secondary/40 bg-white px-3 py-2 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <!-- Event Count Info -->
          <div class="flex items-center gap-2">
            <div class="text-sm text-gray-600">
              <span>Total</span>
              <span class="font-semibold text-primary ml-2">{{ totalCount }}</span>
              <span class="ml-1">event</span>
              <span
                v-if="lastPage > 1"
                class="text-gray-400 mx-2"
              >•</span>
              <span
                v-if="lastPage > 1"
                class="text-gray-500 font-medium"
              >
                Hal. {{ currentPage }}/{{ lastPage }}
              </span>
            </div>
          </div>

          <!-- Mobile View Toggle (Icon Only) -->
          <div
            class="inline-flex items-center gap-1 p-1 rounded-lg bg-gray-100"
          >
            <button
              :class="[
                'p-2 rounded-md transition',
                viewMode === 'grid'
                  ? 'bg-secondary text-primary'
                  : 'bg-white border border-secondary/40 text-gray-500 hover:border-secondary/60'
              ]"
              aria-label="Grid View"
              @click="viewMode = 'grid'"
            >
              <IconMdiViewGrid class="h-5 w-5" />
            </button>
            <button
              :class="[
                'p-2 rounded-md transition',
                viewMode === 'table'
                  ? 'bg-secondary text-primary'
                  : 'bg-white border border-secondary/40 text-gray-500 hover:border-secondary/60'
              ]"
              aria-label="Table View"
              @click="viewMode = 'table'"
            >
              <IconMdiViewList class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Event List -->
      <div v-if="pending && events.length === 0">
        <!-- Grid Skeleton -->
        <div
          v-if="viewMode === 'grid'"
          class="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <EventCardSkeleton
            v-for="n in 2"
            :key="`skel-grid-${n}`"
          />
        </div>
        <!-- Table Skeleton -->
        <div
          v-else
          class="space-y-2"
        >
          <div
            v-for="n in 9"
            :key="`skel-table-${n}`"
            class="h-16 w-full rounded-lg skeleton-shine"
          />
        </div>
      </div>
      <div v-else-if="events.length > 0">
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
            <thead
              class="bg-gray-100 text-xs font-semibold uppercase tracking-wider text-primary"
            >
              <tr>
                <th
                  scope="col"
                  class="px-4 sm:px-6 py-4 font-bold text-primary text-xs tracking-wider uppercase"
                >
                  Tanggal
                </th>
                <th
                  scope="col"
                  class="px-4 sm:px-6 py-4 font-bold text-primary text-xs tracking-wider uppercase min-w-60"
                >
                  Nama Event
                </th>
                <th
                  scope="col"
                  class="px-4 sm:px-6 py-4 font-bold text-primary text-xs tracking-wider uppercase min-w-48"
                >
                  Lokasi
                </th>
                <th
                  scope="col"
                  class="px-4 sm:px-6 py-4 font-bold text-primary text-xs tracking-wider uppercase min-w-40"
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
                  <div class="flex flex-col gap-1">
                    <span class="inline-flex flex-wrap items-center gap-2">
                  <div class="flex items-center gap-2">
                    <span
                      :class="[
                        'inline-flex items-center gap-2 font-semibold',
                        event.is_featured_hero
                          ? 'badge-modern text-xs w-fit'
                          : 'text-primary',
                      ]"
                    >
                      <IconHeroiconsSparkles20Solid
                        v-if="event.is_featured_hero"
                        class="h-4 w-4"
                      />
                      {{ event.title }}
                    </span>
                  </div>
                     
                    </span>
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
          Coba ubah atau reset filter pencarian Anda.
        </p>
      </div>

      <!-- Load More Button -->
      <div
        v-if="hasMorePages"
        class="mt-8 text-center"
      >
        <UiAppButton
          size="md"
          variant="primary"
          :is-loading="pending"
          @click="loadMore()"
        >
          <span v-if="!pending">Muat Lebih Banyak</span>
          <span
            v-else
            class="flex items-center gap-2 justify-center"
          >
            <svg
              class="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sedang memuat...
          </span>
        </UiAppButton>
      </div>

      <!-- End of Results -->
      <div
        v-else-if="events.length > 0"
        class="mt-12 text-center py-6"
      >
        <p class="text-sm text-gray-500 font-medium">
          ✓ Semua event sudah ditampilkan
        </p>
      </div>


      <!-- Mobile Filter Button - Fixed at bottom (Mobile Only) -->
      <div
        class="lg:hidden fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
      >
        <button
          class="flex items-center justify-center gap-2 bg-secondary text-primary px-6 py-3 rounded-full shadow-lg font-medium pointer-events-auto hover:bg-secondary/90 transition-colors"
          @click="showMobileFilter = true"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Filter Event</span>
          <span
            v-if="Object.values(filters).some(v => v && v !== 'latest')"
            class="flex items-center justify-center w-5 h-5 bg-primary text-secondary text-xs font-bold rounded-full"
          >
            {{ Object.values(filters).filter(v => v && v !== 'latest').length }}
          </span>
        </button>
      </div>

      <!-- Mobile Filter Overlay (Mobile Only) -->
      <Teleport to="body">
        <transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showMobileFilter"
            class="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            @click="showMobileFilter = false"
          />
        </transition>

        <!-- Filter Sheet -->
        <transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="translate-y-full"
          enter-to-class="translate-y-0"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="translate-y-0"
          leave-to-class="translate-y-full"
        >
          <div
            v-if="showMobileFilter"
            class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <!-- Drag Handle -->
            <div class="w-12 h-1.5 bg-gray-300 mx-auto my-3 rounded-full" />

            <!-- Filter Header -->
            <div
              class="px-6 pt-2 pb-4 border-b border-secondary/20 flex items-center justify-between flex-shrink-0"
            >
              <h3 class="text-xl font-bold text-primary">
                Filter
              </h3>
              <div class="flex items-center gap-4">
                <button
                  class="text-sm text-secondary hover:text-secondary/80 flex items-center gap-1 font-medium"
                  @click="() => {
                    resetFilters()
                    showMobileFilter = false
                  }"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset
                </button>
                <button
                  class="text-gray-400 hover:text-gray-600"
                  @click="showMobileFilter = false"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Filter Tabs -->
            <div
              class="px-4 py-3 bg-gray-50 border-b border-secondary/20 flex-shrink-0 overflow-x-auto"
            >
              <div class="flex gap-2 min-w-min">
                <button
                  v-for="tab in ['search', 'month', 'province', 'sort']"
                  :key="tab"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                    activeFilterTab === tab
                      ? 'bg-white text-secondary border border-secondary/40'
                      : 'text-gray-600 hover:text-gray-900',
                  ]"
                  @click="activeFilterTab = tab as any"
                >
                  {{
                    tab === 'month'
                      ? 'Bulan/Tahun'
                      : tab === 'province'
                        ? 'Provinsi'
                        : tab === 'sort'
                          ? 'Urutkan'
                          : 'Cari'
                  }}
                </button>
              </div>
            </div>

            <!-- Filter Content -->
            <div class="flex-1 overflow-y-auto">
              <!-- Search Tab -->
              <div
                v-if="activeFilterTab === 'search'"
                class="p-6 space-y-4"
              >
                <div class="relative">
                  <input
                    v-model="filters.search"
                    type="text"
                    placeholder="Cari nama event..."
                    class="w-full rounded-lg border border-secondary/60 bg-white py-3 pl-10 pr-4 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  >
                  <IconMdiMagnify class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <!-- Month Tab -->
              <div
                v-if="activeFilterTab === 'month'"
                class="p-6 space-y-4"
              >
                <div>
                  <p class="text-sm font-semibold text-gray-700 mb-3">
                    Tahun
                  </p>
                  <div class="grid grid-cols-5 gap-2">
                    <button
                      v-for="year in availableYears"
                      :key="year"
                      :class="[
                        'py-2 text-sm font-medium rounded-lg transition-colors',
                        (filters.year ? Number(filters.year) === year : selectedYear === year)
                          ? 'bg-secondary text-primary'
                          : 'border border-secondary/40 hover:bg-gray-100',
                      ]"
                      @click="handleYearSelect(year)"
                    >
                      {{ year }}
                    </button>
                  </div>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-700 mb-3">
                    Bulan
                  </p>
                  <div class="grid grid-cols-4 gap-2">
                    <button
                      v-for="month in monthOptions"
                      :key="month.value"
                      :class="[
                        'py-2 px-1 text-xs font-medium rounded-lg transition-colors',
                        filters.month === month.value
                          ? 'bg-secondary text-primary'
                          : 'hover:bg-gray-100',
                      ]"
                      :title="month.label"
                      @click="handleMonthSelect(month.value)"
                    >
                      {{ month.label.slice(0, 3) }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Province Tab -->
              <div
                v-if="activeFilterTab === 'province'"
                class="p-6 space-y-3"
              >
                <label
                  v-for="province in provinces"
                  :key="province.slug"
                  class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
                >
                  <div class="relative w-5 h-5 flex-shrink-0">
                    <input
                      type="checkbox"
                      :checked="
                        Array.isArray(filters.province)
                          ? filters.province.includes(province.slug)
                          : filters.province === province.slug
                      "
                      class="absolute opacity-0 w-0 h-0"
                      @change="
                        () => {
                          if (Array.isArray(filters.province)) {
                            const index = filters.province.indexOf(province.slug)
                            if (index > -1) {
                              filters.province.splice(index, 1)
                            } else {
                              filters.province.push(province.slug)
                            }
                          } else {
                            filters.province =
                              filters.province === province.slug ? [] : [province.slug]
                          }
                        }
                      "
                    >
                    <div
                      class="w-5 h-5 border-2 border-secondary/60 rounded-md flex items-center justify-center transition-colors"
                      :class="
                        (
                          Array.isArray(filters.province)
                            ? filters.province.includes(province.slug)
                            : filters.province === province.slug
                        )
                          ? 'bg-secondary border-secondary'
                          : 'group-hover:border-secondary'
                      "
                    >
                      <svg
                        v-if="
                          Array.isArray(filters.province)
                            ? filters.province.includes(province.slug)
                            : filters.province === province.slug
                        "
                        class="w-3 h-3 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <span class="text-gray-900 font-medium">{{ province.name }}</span>
                  <span
                    v-if="province.event_count"
                    class="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >{{ province.event_count }}</span>
                </label>
              </div>

              <!-- Sort Tab -->
              <div
                v-if="activeFilterTab === 'sort'"
                class="p-6 space-y-3"
              >
                <label
                  v-for="sort in sortOptions"
                  :key="sort.value"
                  class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
                >
                  <div class="relative w-5 h-5 flex-shrink-0">
                    <input
                      type="radio"
                      :checked="filters.sort === sort.value"
                      class="absolute opacity-0 w-0 h-0"
                      @change="filters.sort = sort.value"
                    >
                    <div
                      class="w-5 h-5 border-2 border-secondary/60 rounded-full flex items-center justify-center transition-colors"
                      :class="
                        filters.sort === sort.value
                          ? 'bg-secondary border-secondary'
                          : 'group-hover:border-secondary'
                      "
                    >
                      <div
                        v-if="filters.sort === sort.value"
                        class="w-2 h-2 bg-primary rounded-full"
                      />
                    </div>
                  </div>
                  <span class="text-gray-900 font-medium">{{ sort.label }}</span>
                </label>
              </div>
            </div>

            <!-- Apply Button -->
            <div class="sticky bottom-0 bg-white border-t border-secondary/20 p-4 flex-shrink-0">
              <UiAppButton
                block
                size="lg"
                variant="secondary"
                @click="showMobileFilter = false"
              >
                Terapkan Filter
              </UiAppButton>
            </div>
          </div>
        </transition>
      </Teleport>
    </div>
  </div>
</template>
