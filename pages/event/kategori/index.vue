<script setup lang="ts">
/**
 * Halaman INDEX Kategori - Listing semua kategori/tipe event
 * 
 * URL: /event/kategori
 * SEO Strategy: Hub page untuk internal linking & breadcrumb hierarchy
 * TIDAK ADA DI NAVIGATION - hanya untuk breadcrumb & sitemap
 */

import { computed } from 'vue'
import { useImage } from '#imports'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useEventTypes } from '~/composables/useEventTypes'
import { useAdBanners } from '~/composables/useAdBanners'
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { EventType } from '~/types/event'
import IconHeroiconsTag20Solid from '~icons/heroicons/tag-20-solid'

const $img = useImage()

const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchActiveEventTypes } = useEventTypes()
const { fetchResponsiveBanners } = useAdBanners()

// Fetch event types
const { data: eventTypesData } = await useAsyncData('event-types-active', () => fetchActiveEventTypes())
const eventTypes = computed<EventType[]>(() => eventTypesData.value?.data ?? [])

// SEO
const currentYear = new Date().getFullYear()
const seoTitle = `Kategori Event Lari ${currentYear} - Marathon, Fun Run, Trail Running`
const seoDescription = `Jelajahi ${eventTypes.value.length}+ kategori event lari di Indonesia: Marathon, Half Marathon, Fun Run, Trail Running, Virtual Run, dan lainnya.`

useSeoMetaDynamic({
  title: seoTitle,
  description: seoDescription,
  url: '/event/kategori',
  type: 'website',
})

// Schema.org
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/event/kategori`,
    name: seoTitle,
    description: seoDescription,
    '@type': 'CollectionPage',
  }),
])

// Breadcrumbs (Home otomatis ditambahkan oleh komponen Breadcrumb)
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Event', link: '/event' },
  { text: 'Kategori', link: '/event/kategori' },
])

useBreadcrumbSchema(breadcrumbs)

// Build image URL for event type
const buildTypeImage = (src?: string | null) => {
  if (!src) return ''
  return $img(src, {
    width: 1280,
    height: 720,
    format: 'webp',
    quality: 80,
  })
}

// Header
const headerBg = computed(() => getImage('header_bg_events', null) ?? undefined)
const { data: eventHeaderBanners } = await useAsyncData('ad-banners-event-header-kategori', () =>
  fetchResponsiveBanners('page_header_event')
)
const headerAdBanners = computed(() => eventHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => eventHeaderBanners.value?.mobile ?? [])
</script>

<template>
  <div>
    <!-- Page Header -->
    <LayoutPageHeader
      title="Kategori Event Lari"
      :description="`Temukan ${eventTypes.length} kategori event lari di Indonesia`"
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
            Pilih Kategori Event Favoritmu
          </h2>
          <p class="text-gray-600">
            Dari fun run santai hingga ultra marathon, temukan kategori event lari yang sesuai dengan kemampuanmu.
          </p>
        </div>

        <!-- Event Type Grid (Styling seperti EventTypeSection) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="type in eventTypes"
            :key="type.id"
            :to="`/event/kategori/${type.slug}`"
            class="group relative h-64 overflow-hidden rounded-2xl bg-primary transition-all hover:shadow-xl"
          >
            <!-- Image -->
            <img
              v-if="type.image"
              :src="buildTypeImage(type.image)"
              :alt="type.name"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              width="1280"
              height="720"
            >
            <!-- Fallback gradient -->
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-black text-center text-white"
            >
              <span class="text-lg font-semibold tracking-wider uppercase">{{ type.name }}</span>
            </div>
            
            <!-- Overlay gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-transparent" />
            
            <!-- Content -->
            <div class="absolute inset-0 flex flex-col justify-between p-5 text-white">
              <span class="badge-modern inline-flex items-center gap-2 self-start">
                <IconHeroiconsTag20Solid class="h-4 w-4" />
                Kategori
              </span>
              <div>
                <h3 class="text-xl font-semibold tracking-tight mb-1">
                  {{ type.name }}
                </h3>
                <p class="text-sm text-white/80">
                  {{ type.event_count || 0 }} event tersedia
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty State -->
        <div
          v-if="eventTypes.length === 0"
          class="text-center py-16 text-gray-500"
        >
          <p>Belum ada kategori event aktif.</p>
        </div>
      </div>
    </section>
  </div>
</template>

