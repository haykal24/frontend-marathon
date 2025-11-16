<script setup lang="ts">
import { computed } from 'vue'
import EcosystemTable from '~/components/ecosystem/EcosystemTable.vue'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useApi } from '~/composables/useApi'
import LayoutPageHeader from '~/components/layout/PageHeader.vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'
import { useSiteSettings } from '~/composables/useSiteSettings'
import IconHeroiconsDocumentPlus from '~icons/heroicons/document-plus'

useSeoMetaDynamic({
  title: 'Dashboard EO - indonesiamarathon.com',
  description: 'Pantau status pengajuan event Anda dan mulai kirim event baru.',
  url: '/eo/dashboard',
})

const api = useApi()
const { getImage } = useSiteSettings()
const headerBg = computed(() => getImage('header_bg_dashboard', getImage('header_bg_static', null)) ?? undefined)

const {
  data,
  pending,
  error,
  refresh,
} = await useAsyncData('eo-my-events', async () => {
  const res = await api.get('/events?mine=1&per_page=50&sort=latest')
  return res.data
})

const events = computed(() => (data.value?.data ?? []) as any[])
const total = computed(() => data.value?.meta?.total ?? events.value.length)
const pendingCount = computed(() => events.value.filter(e => e.status === 'pending_review').length)
const publishedCount = computed(() => events.value.filter(e => e.status === 'published').length)
const draftCount = computed(() => events.value.filter(e => e.status === 'draft').length)

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [{ text: 'Dashboard EO', link: null }])
</script>

<template>
  <div class="min-h-screen bg-surface">
    <LayoutPageHeader
      title="Dashboard EO"
      description="Kelola pengajuan event Anda. Lacak status dan kirim event baru."
      :breadcrumbs="breadcrumbItems"
      :background-image-url="headerBg"
    />

    <section class="py-10">
      <div class="layout-container space-y-6">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div class="rounded-2xl border border-secondary/30 bg-white p-5">
            <div class="text-xs uppercase tracking-[0.2em] text-gray-500">Total Event</div>
            <div class="mt-1 text-2xl font-bold text-primary">{{ total }}</div>
          </div>
          <div class="rounded-2xl border border-secondary/30 bg-white p-5">
            <div class="text-xs uppercase tracking-[0.2em] text-gray-500">Published</div>
            <div class="mt-1 text-2xl font-bold text-primary">{{ publishedCount }}</div>
          </div>
          <div class="rounded-2xl border border-secondary/30 bg-white p-5">
            <div class="text-xs uppercase tracking-[0.2em] text-gray-500">Pending Review</div>
            <div class="mt-1 text-2xl font-bold text-primary">{{ pendingCount }}</div>
          </div>
          <div class="rounded-2xl border border-secondary/30 bg-white p-5">
            <div class="text-xs uppercase tracking-[0.2em] text-gray-500">Draft</div>
            <div class="mt-1 text-2xl font-bold text-primary">{{ draftCount }}</div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <span class="badge-modern inline-flex items-center gap-2">
              <IconHeroiconsSparkles20Solid class="h-4 w-4" />
              Event Saya
            </span>
            <h2 class="text-xl lg:text-2xl font-bold text-primary tracking-tighter leading-tight">
              Riwayat Pengajuan Event
            </h2>
          </div>
          <UiAppButton
            to="/event/submit"
            variant="secondary"
            size="md"
            class="font-semibold"
            :icon="IconHeroiconsDocumentPlus"
          >
            Kirim Event
          </UiAppButton>
        </div>

        <div class="rounded-2xl">
          <EcosystemTable background="white">
            <template #header>
              <tr>
                <th class="px-4 py-4 text-left max-w-[320px]">Event</th>
                <th class="px-4 py-4 text-left whitespace-nowrap">Tanggal</th>
                <th class="px-4 py-4 text-left">Lokasi</th>
                <th class="px-4 py-4 text-left whitespace-nowrap">Status</th>
                <th class="px-4 py-4 text-left whitespace-nowrap">Dikirim</th>
                <th class="px-4 py-4 text-left">Aksi</th>
              </tr>
            </template>
            <template #body>
              <tr v-if="pending">
                <td colspan="6" class="px-4 py-6 text-center text-gray-500">Memuat data...</td>
              </tr>
              <tr v-else-if="error">
                <td colspan="6" class="px-4 py-6 text-center text-red-500">Gagal memuat data. Coba lagi.</td>
              </tr>
              <tr v-else-if="!events.length">
                <td colspan="6" class="px-4 py-10 text-center text-gray-500">
                  Belum ada pengajuan event. Mulai dengan tombol "Kirim Event".
                </td>
              </tr>
              <tr v-else v-for="ev in events" :key="ev.id" class="align-top bg-white">
                <td class="px-4 py-5 max-w-[320px]">
                  <div class="space-y-1">
                    <NuxtLink
                      :to="`/event/${ev.slug}`"
                      class="text-primary font-semibold hover:underline"
                      v-if="ev.status === 'published'"
                    >
                      {{ ev.title }}
                    </NuxtLink>
                    <span v-else class="text-gray-800 font-semibold">{{ ev.title }}</span>
                    <div class="text-xs text-gray-500 line-clamp-2">
                      {{ ev.description }}
                    </div>
                  </div>
                </td>
                <td class="px-4 py-5 whitespace-nowrap text-sm text-gray-700">
                  {{ ev.event_date }}
                  <span v-if="ev.event_end_date" class="text-gray-400">— {{ ev.event_end_date }}</span>
                </td>
                <td class="px-4 py-5 text-sm text-gray-700">
                  <div class="flex flex-col">
                    <span>{{ ev.location_name }}</span>
                    <span class="text-gray-500 text-xs">{{ ev.city }}</span>
                  </div>
                </td>
                <td class="px-4 py-5 whitespace-nowrap">
                  <span
                    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                    :class="{
                      'bg-yellow-100 text-yellow-800': ev.status === 'pending_review',
                      'bg-green-100 text-green-800': ev.status === 'published',
                      'bg-gray-100 text-gray-700': ev.status === 'draft',
                    }"
                  >
                    {{ ev.status === 'pending_review' ? 'Pending Review' : (ev.status === 'published' ? 'Published' : 'Draft') }}
                  </span>
                </td>
                <td class="px-4 py-5 whitespace-nowrap text-sm text-gray-700">
                  {{ ev.created_at }}
                </td>
                <td class="px-4 py-5">
                  <div class="flex flex-wrap gap-2">
                    <NuxtLink
                      v-if="ev.status === 'published'"
                      :to="`/event/${ev.slug}`"
                      class="inline-flex items-center rounded-full border border-secondary/40 bg-white px-3 py-1 text-xs font-medium text-primary hover:bg-secondary/10"
                    >
                      Lihat Publik
                    </NuxtLink>
                    <NuxtLink
                      :to="`/event/${ev.slug}`"
                      class="inline-flex items-center rounded-full border border-secondary/40 bg-white px-3 py-1 text-xs font-medium text-primary hover:bg-secondary/10"
                    >
                      Detail
                    </NuxtLink>
                  </div>
                </td>
              </tr>
            </template>
          </EcosystemTable>
        </div>
      </div>
    </section>
  </div>
</template>

