<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useCurrentYear } from '~/composables/useCurrentYear'
import { useHomepageData } from '~/composables/useHomepageData'
import type { AdBanner } from '~/types/ad'
import type { BlogPost } from '~/types/blog'
import type { Event, EventType, Province } from '~/types/event'

const { currentYear } = useCurrentYear()

// SEO: Meta tags dinamis untuk homepage
useSeoMetaDynamic({
  // OPTIMASI: Menggunakan keyword utama bervolume tinggi sesuai dokumentasi SEO
  title: `Kalender Lari ${currentYear.value} & Jadwal Marathon Indonesia`,
  description: `Jelajahi jadwal lari ${currentYear.value} terlengkap dari indonesiamarathon.com: temukan event running favorit, fun run seru, dan ekosistem seputar lari di seluruh Indonesia.`,
  url: '/',
})

// SEO: OG Image akan menggunakan fallback og.webp (sudah dikonfigurasi di nuxt.config.ts)
// Tidak perlu defineOgImage di sini karena homepage menggunakan default

const homepage = useHomepageData()

const pending = computed<boolean>(() => homepage.pending.value)
const featuredHeroEvents = computed<Event[]>(() => homepage.featuredHeroEvents.value ?? [])
const sliderBanners = computed<AdBanner[]>(() => homepage.sliderBanners.value ?? [])
const bannerMain = computed<AdBanner[]>(() => homepage.bannerMain.value ?? [])
const bannerSidebar1 = computed<AdBanner[]>(() => homepage.bannerSidebar1.value ?? [])
const bannerSidebar2 = computed<AdBanner[]>(() => homepage.bannerSidebar2.value ?? [])
const bannerMainMobile = computed<AdBanner[]>(() => homepage.bannerMainMobile.value ?? bannerMain.value)
const bannerSidebar1Mobile = computed<AdBanner[]>(() => homepage.bannerSidebar1Mobile.value ?? bannerSidebar1.value)
const bannerSidebar2Mobile = computed<AdBanner[]>(() => homepage.bannerSidebar2Mobile.value ?? bannerSidebar2.value)
const eventTypes = computed<EventType[]>(() => homepage.eventTypes.value ?? [])
const eventsByType = computed<Record<string, Event[]>>(() => homepage.eventsByType.value ?? {})
const latestEvents = computed<Event[]>(() => homepage.latestEvents.value ?? [])
const provinces = computed<Province[]>(() => homepage.provinces.value ?? [])
const blogPosts = computed<BlogPost[]>(() => homepage.blogPosts.value ?? [])
const ctaBanner = computed<AdBanner | null>(() => homepage.ctaBanner.value ?? null)
const promoBanners = computed<AdBanner[]>(() => [
  ...bannerMain.value,
  ...bannerSidebar1.value,
  ...bannerSidebar2.value,
])
const promoBannersMobile = computed<AdBanner[]>(() => {
  const combined = [
    ...bannerMainMobile.value,
    ...bannerSidebar1Mobile.value,
    ...bannerSidebar2Mobile.value,
  ]
  return combined.length > 0 ? combined : promoBanners.value
})
const calendarStats = computed<Record<number, number>>(() => homepage.calendarStats.value ?? {})

defineExpose({
  pending,
  featuredHeroEvents,
  sliderBanners,
  promoBanners,
  promoBannersMobile,
  eventTypes,
  eventsByType,
  latestEvents,
  provinces,
  calendarStats,
  blogPosts,
  ctaBanner,
})
</script>

<template>
  <div class="min-h-screen bg-surface">
    <!-- Hero Section -->
    <SectionsHeroSection
      :is-loading="pending"
      :featured-events="featuredHeroEvents"
      :banners="sliderBanners"
    />

    <!-- Skeleton Loader for Sections -->
    <div v-if="pending">
      <div class="layout-container py-16 space-y-16">
        <!-- Skeleton for Event Types -->
        <div>
          <div class="h-3 rounded-full bg-primary/10 w-32 animate-pulse mb-4" />
          <div class="h-10 w-1/2 max-w-md rounded-lg bg-primary/10 animate-pulse mb-6" />
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="i in 3"
              :key="`types-${i}`"
              class="h-64 rounded-2xl bg-primary/5 animate-pulse"
            />
          </div>
        </div>
        <!-- Skeleton for Latest Events -->
        <div>
          <div class="h-3 rounded-full bg-primary/10 w-36 animate-pulse mb-4" />
          <div class="h-10 w-1/2 max-w-md rounded-lg bg-primary/10 animate-pulse mb-6" />
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="i in 3"
              :key="`latest-${i}`"
              class="h-80 rounded-2xl bg-primary/5 animate-pulse"
            />
          </div>
        </div>
        <!-- Skeleton for Province Gallery -->
        <div>
          <div class="h-3 rounded-full bg-primary/10 w-40 animate-pulse mb-4" />
          <div class="h-10 w-1/2 max-w-md rounded-lg bg-primary/10 animate-pulse mb-6" />
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <div
              v-for="i in 3"
              :key="`province-${i}`"
              class="h-64 rounded-2xl bg-primary/5 animate-pulse"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Sections rendered after data is loaded -->
    <div v-else>
      <SectionsAdBannerSection
        v-if="promoBanners.length > 0"
        :banners="promoBanners"
        :banners-mobile="promoBannersMobile"
      />

      <!-- Event Types Section -->
      <SectionsEventTypeSection
        v-if="eventTypes.length > 0"
        :event-types="eventTypes"
        :events-by-type="eventsByType"
      />

      <!-- Latest Events Section -->
      <SectionsEventLatestSection
        v-if="latestEvents.length > 0"
        :events="latestEvents"
      />

      <!-- Provinces Section -->
      <SectionsProvinceSection
        v-if="provinces.length > 0"
        :provinces="provinces"
      />

      <!-- Calendar Section -->
      <SectionsCalendarSection :stats="calendarStats" />

      <!-- CTA Section -->
      <SectionsCtaSection :banner="ctaBanner" />

      <!-- Blog Section -->
      <SectionsBlogSection
        v-if="blogPosts.length > 0"
        :posts="blogPosts"
      />
    </div>
  </div>
</template>
