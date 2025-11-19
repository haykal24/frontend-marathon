<script setup lang="ts">
import { computed } from 'vue'
import { useMitra } from '~/composables/useMitra'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import LayoutPageHeader from '~/components/layout/PageHeader.vue'
import MitraSidebarNav from '~/components/mitra/SidebarNav.vue'
import MitraEventTable from '~/components/mitra/MitraEventTable.vue'
import type { Event } from '~/types/event'

import IconMdiCalendarMultiple from '~icons/mdi/calendar-multiple'
import IconMdiClockOutline from '~icons/mdi/clock-outline'
import IconMdiCheckCircle from '~icons/mdi/check-circle'
import IconMdiEyeOutline from '~icons/mdi/eye-outline'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'

definePageMeta({
  middleware: ['auth'],
})

useSeoMetaDynamic({
  title: 'Event Saya - Dashboard Mitra',
  description: 'Kelola dan pantau status semua event lari Anda.',
  url: '/mitra/my-events',
})

const { fetchDashboardStats, fetchMyEvents } = useMitra()
const { getImage } = useSiteSettings()
const headerBg = computed(() => getImage('header_bg_dashboard', getImage('header_bg_static', null)) ?? undefined)

const currentPage = ref(1)
const perPage = ref(12)

// Fetch dashboard stats (auth protected, server-side counts)
const { data: stats } = await useAsyncData(
  'mitra-my-events-stats',
  () => fetchDashboardStats()
)

const { data, pending, error, refresh } = await useAsyncData(
  'mitra-all-events',
  () => fetchMyEvents({
    per_page: perPage.value,
    page: currentPage.value,
    sort: 'latest',
  }),
  {
    watch: [currentPage, perPage],
  }
)

const events = computed<Event[]>(() => {
  if (!data.value) return []
  // Response structure: { data: Event[], meta: { pagination: {...} } }
  return Array.isArray(data.value.data) ? data.value.data : []
})
const pagination = computed(() => data.value?.meta?.pagination)
const totalPages = computed(() => Math.ceil((stats.value?.total_events ?? 0) / perPage.value))

// Use stats from API instead of counting from fetched events
const total = computed(() => stats.value?.total_events ?? 0)
const pendingCount = computed(() => stats.value?.pending_count ?? 0)
const publishedCount = computed(() => stats.value?.published_count ?? 0)

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { text: 'Dashboard Mitra', link: '/mitra/dashboard' },
  { text: 'Event Saya', link: null },
])

const statusBadgeClass = (status?: string) => {
  return {
    pending_review: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
  }[status ?? ''] || 'bg-gray-100 text-gray-800'
}

const statusLabel = (status?: string) => {
  if (!status) return 'Draft'
  return {
    pending_review: 'Menunggu Review',
    published: 'Dipublikasikan',
    draft: 'Draft',
  }[status] || status
}

const formatEventDate = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return date.toLocaleDateString('id-ID', { dateStyle: 'short' })
}

const getEventKey = (event: Event, index: number) => {
  return String(event.id ?? event.slug ?? index)
}

const handleRefresh = () => {
  return refresh()
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <LayoutPageHeader
      title="Event Saya"
      description="Lihat dan kelola semua event lari yang telah Anda kirimkan."
      :breadcrumbs="breadcrumbItems"
      :background-image-url="headerBg"
    />

    <section class="py-10">
      <div class="layout-container">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <MitraSidebarNav />
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3 space-y-6">
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div class="group relative rounded-2xl border border-secondary/30 bg-white p-6 hover:border-secondary transition-colors overflow-hidden">
                <div class="relative z-10">
                  <div class="text-sm font-semibold text-gray-700 mb-2">
                    Total Event
                  </div>
                  <div class="text-2xl lg:text-3xl font-bold text-primary mb-2">
                    {{ total }}
                  </div>
                  <p class="text-sm text-gray-600">
                    Semua event Anda
                  </p>
                </div>
                <!-- Watermark Icon -->
                <div class="absolute -right-4 top-0 h-24 w-24 rounded-full bg-secondary/20 blur-xl" />
                <div class="absolute right-4 top-4 text-primary/20 group-hover:text-primary/30 transition-colors">
                  <IconMdiCalendarMultiple class="h-14 w-14" />
                </div>
              </div>
              <div class="group relative rounded-2xl border border-secondary/30 bg-white p-6 hover:border-secondary transition-colors overflow-hidden">
                <div class="relative z-10">
                  <div class="text-sm font-semibold text-gray-700 mb-2">
                    Menunggu Review
                  </div>
                  <div class="text-2xl lg:text-3xl font-bold text-primary mb-2">
                    {{ pendingCount }}
                  </div>
                  <p class="text-sm text-gray-600">
                    Sedang direview admin
                  </p>
                </div>
                <!-- Watermark Icon -->
                <div class="absolute -right-4 top-0 h-24 w-24 rounded-full bg-secondary/20 blur-xl" />
                <div class="absolute right-4 top-4 text-primary/20 group-hover:text-primary/30 transition-colors">
                  <IconMdiClockOutline class="h-14 w-14" />
                </div>
              </div>
              <div class="group relative rounded-2xl border border-secondary/30 bg-white p-6 hover:border-secondary transition-colors overflow-hidden">
                <div class="relative z-10">
                  <div class="text-sm font-semibold text-gray-700 mb-2">
                    Dipublikasikan
                  </div>
                  <div class="text-2xl lg:text-3xl font-bold text-primary mb-2">
                    {{ publishedCount }}
                  </div>
                  <p class="text-sm text-gray-600">
                    Event aktif di platform
                  </p>
                </div>
                <!-- Watermark Icon -->
                <div class="absolute -right-4 top-0 h-24 w-24 rounded-full bg-secondary/20 blur-xl" />
                <div class="absolute right-4 top-4 text-primary/20 group-hover:text-primary/30 transition-colors">
                  <IconMdiCheckCircle class="h-14 w-14" />
                </div>
              </div>
            </div>

            <!-- Events Table -->
            <div class="rounded-2xl border border-secondary/20 bg-white overflow-hidden">
              <div class="p-5 border-b border-secondary/10 bg-gray-50/50">
                <h3 class="text-lg font-semibold text-primary">
                  Daftar Event Anda
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  Menampilkan {{ events.length }} dari {{ total }} event
                </p>
              </div>

              <div
                v-if="pending"
                class="p-8 text-center text-gray-500"
              >
                <div class="inline-flex items-center gap-2">
                  <div class="h-4 w-4 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
                  <span>Memuat data...</span>
                </div>
              </div>

              <div
                v-else-if="error"
                class="p-8 text-center text-red-500"
              >
                Gagal memuat event. <button
                  class="text-secondary hover:underline"
                  @click="handleRefresh"
                >
                  Coba lagi
                </button>
              </div>

              <div
                v-else-if="events.length === 0"
                class="p-8 text-center text-gray-500"
              >
                <p class="mb-4">
                  Anda belum mengirim event apapun.
                </p>
                <NuxtLink
                  to="/mitra/event/submit"
                  class="text-secondary font-medium hover:underline"
                >
                  Kirim event pertamamu sekarang
                </NuxtLink>
              </div>

              <div v-else>
                <MitraEventTable background="white">
                  <template #header>
                    <tr>
                      <th class="px-6 py-4 text-left">
                        Event
                      </th>
                      <th class="px-6 py-4 text-left whitespace-nowrap">
                        Tanggal Event
                      </th>
                      <th class="px-6 py-4 text-left">
                        Lokasi
                      </th>
                      <th class="px-6 py-4 text-left">
                        Kategori
                      </th>
                      <th class="px-6 py-4 text-left">
                        Status
                      </th>
                      <th class="px-6 py-4 text-center">
                        Aksi
                      </th>
                    </tr>
                  </template>
                  <template #body>
                    <tr
                      v-for="(event, index) in events"
                      :key="getEventKey(event, index)"
                      class="hover:bg-gray-50/50 transition-colors"
                    >
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div
                            v-if="event.image"
                            class="flex-shrink-0"
                          >
                            <NuxtImg
                              :src="event.image"
                              :alt="event.title"
                              class="h-12 w-12 rounded-lg object-cover"
                              preset="avatar"
                              width="48"
                              height="48"
                              format="webp"
                              loading="lazy"
                              sizes="48px"
                            />
                          </div>
                          <div class="min-w-0 flex-1">
                            <div class="font-semibold text-primary truncate">
                          {{ event.title }}
                            </div>
                            <div
                              v-if="event.description"
                              class="text-xs text-gray-500 mt-1 line-clamp-1"
                            >
                              {{ event.description }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">
                          {{ formatEventDate(event.event_date) }}
                        </div>
                        <div
                          v-if="event.event_end_date && event.event_end_date !== event.event_date"
                          class="text-xs text-gray-500"
                        >
                          s/d {{ formatEventDate(event.event_end_date) }}
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-900">
                          {{ event.location_name || 'Tidak tercantum' }}
                        </div>
                        <div class="text-xs text-gray-500">
                          {{ event.city }}{{ event.province ? `, ${event.province}` : '' }}
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div
                          v-if="event.categories && event.categories.length > 0"
                          class="flex flex-wrap gap-1"
                        >
                          <span
                            v-for="category in event.categories"
                            :key="typeof category === 'object' ? category.id : category"
                            class="inline-flex items-center rounded-md bg-secondary/10 px-2 py-1 text-xs font-medium text-primary"
                          >
                            {{ typeof category === 'object' ? category.name : category }}
                          </span>
                        </div>
                        <span
                          v-else
                          class="text-xs text-gray-400"
                        >
                          -
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span :class="['inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap', statusBadgeClass(event.status)]">
                          {{ statusLabel(event.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right whitespace-nowrap">
                        <NuxtLink
                          :to="`/mitra/event/detail/${event.id}`"
                          class="inline-flex items-center gap-1.5 rounded-lg border border-secondary bg-white px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-secondary/10 transition-colors"
                        >
                          <IconMdiEyeOutline class="h-4 w-4" />
                          <span>Lihat</span>
                        </NuxtLink>
                      </td>
                    </tr>
                  </template>
                </MitraEventTable>

                <!-- Pagination -->
                <div
                  v-if="totalPages > 1"
                  class="px-5 py-4 border-t border-secondary/10 bg-gray-50/50"
                >
                  <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-600">
                      Halaman {{ currentPage }} dari {{ totalPages }}
                    </div>
                    <div class="flex gap-2">
                      <button
                        :disabled="currentPage === 1"
                        class="px-4 py-2 text-sm font-semibold rounded-xl border border-secondary/40 bg-white hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        @click="handlePageChange(currentPage - 1)"
                      >
                        Sebelumnya
                      </button>
                      <button
                        :disabled="currentPage === totalPages"
                        class="px-4 py-2 text-sm font-semibold rounded-xl border border-secondary/40 bg-white hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        @click="handlePageChange(currentPage + 1)"
                      >
                        Berikutnya
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

