<script setup lang="ts">
import { useMitra } from '~/composables/useMitra'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import LayoutPageHeader from '~/components/layout/PageHeader.vue'
import MitraDetailSection from '~/components/mitra/MitraDetailSection.vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { Event } from '~/types/event'
import MitraSidebarNav from '~/components/mitra/SidebarNav.vue'

definePageMeta({
  middleware: ['auth'],
  layout: 'mitra',
})

const route = useRoute()
const eventId = computed(() => Number(route.params.id as string))

const { fetchMyEventById } = useMitra()

const { data: event, error } = await useAsyncData(
  `mitra-event-${eventId.value}`,
  () => fetchMyEventById(eventId.value),
  { watch: [eventId] }
)

if (error.value || !event.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Event tidak ditemukan atau Anda tidak memiliki akses.',
    fatal: true,
  })
}

useSeoMetaDynamic({
  title: () => `Detail Event: ${event.value?.title || 'Event Saya'}`,
  description: 'Lihat detail event yang telah Anda ajukan.',
})

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { text: 'Event Saya', link: '/mitra/my-events' },
  { text: 'Detail Event', link: null },
])

const statusBadgeClass = (status?: string) => {
  if (!status) return 'bg-gray-100 text-gray-800'
  return {
    pending_review: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
  }[status] || 'bg-gray-100 text-gray-800'
}

const statusLabel = (status?: string) => {
  if (!status) return 'Draft'
  return {
    pending_review: 'Menunggu Review',
    published: 'Dipublikasikan',
    draft: 'Draft',
  }[status] || status
}

const formatSimpleDate = (value?: string | null) => {
  if (!value) return null
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <LayoutPageHeader
      :title="event?.title || 'Detail Event'"
      description="Lihat detail lengkap dari event yang Anda ajukan."
      :breadcrumbs="breadcrumbItems"
    />

    <section class="py-10">
      <div class="layout-container">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <MitraSidebarNav />
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3">
            <div class="rounded-2xl border border-secondary/70 bg-white p-6 lg:p-8">
              <div class="space-y-6">
                <!-- Event Information -->
                <MitraDetailSection
                  title="Informasi Event"
                  description="Informasi dasar mengenai event."
                >
                  <div class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">
                      Poster Event
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <NuxtImg
                        v-if="event?.image"
                        :src="event.image"
                        :alt="event.title"
                        class="w-full h-auto rounded-lg max-h-96 object-contain border border-gray-200"
                      />
                      <p
                        v-else
                        class="text-gray-400"
                      >
                        Tidak ada gambar.
                      </p>
                    </dd>
                  </div>
                  <div class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">
                      Deskripsi
                    </dt>
                    <dd
                      v-if="event?.description"
                      class="mt-1 text-sm text-gray-900 prose prose-sm max-w-none"
                      v-html="event.description"
                    />
                    <dd
                      v-else
                      class="mt-1 text-sm text-gray-400"
                    >
                      Tidak ada deskripsi.
                    </dd>
                  </div>
                </MitraDetailSection>

                <!-- Location & Time -->
                <MitraDetailSection
                  title="Lokasi & Waktu"
                  description="Informasi lokasi dan jadwal pelaksanaan event."
                >
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">
                      Nama Lokasi
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ event?.location_name || '-' }}
                    </dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">
                      Kota / Provinsi
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ event?.city }}{{ event?.province ? `, ${event.province}` : '' }}
                    </dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">
                      Tanggal Mulai
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ formatSimpleDate(event?.event_date) || '-' }}
                    </dd>
                  </div>
                  <div class="sm:col-span-1">
                    <dt class="text-sm font-medium text-gray-500">
                      Tanggal Berakhir
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ formatSimpleDate(event?.event_end_date) || 'Satu hari' }}
                    </dd>
                  </div>
                </MitraDetailSection>

                <!-- Grid 2 Kolom untuk Status & Detail -->
                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <!-- Status -->
                  <MitraDetailSection
                    title="Status Event"
                    description="Status event saat ini."
                  >
                    <div class="sm:col-span-1">
                      <dt class="text-sm font-medium text-gray-500">
                        Status
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        <span :class="['inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap', statusBadgeClass(event?.status)]">
                          {{ statusLabel(event?.status) }}
                        </span>
                      </dd>
                    </div>
                  </MitraDetailSection>

                  <!-- Event Details -->
                  <MitraDetailSection
                    title="Detail Lainnya"
                    description="Informasi pendukung untuk event ini."
                  >
                    <div class="sm:col-span-1">
                      <dt class="text-sm font-medium text-gray-500">
                        Jenis Event
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 uppercase">
                        {{ event?.event_type?.replace('_', ' ') || '-' }}
                      </dd>
                    </div>
                    <div class="sm:col-span-1">
                      <dt class="text-sm font-medium text-gray-500">
                        Organizer
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        {{ event?.organizer_name || '-' }}
                      </dd>
                    </div>
                    <div class="sm:col-span-2">
                      <dt class="text-sm font-medium text-gray-500">
                        Kategori Lomba
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        <div
                          v-if="event?.categories && event.categories.length > 0"
                          class="flex flex-wrap gap-2"
                        >
                          <span
                            v-for="cat in event.categories"
                            :key="cat.id"
                            class="inline-flex items-center rounded-md bg-secondary/10 px-2 py-1 text-xs font-medium text-primary"
                          >
                            {{ cat.name }}
                          </span>
                        </div>
                        <p
                          v-else
                          class="text-gray-400"
                        >
                          -
                        </p>
                      </dd>
                    </div>
                  </MitraDetailSection>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
