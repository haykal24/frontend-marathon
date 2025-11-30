<script setup lang="ts">
import { computed } from 'vue'
import { useImage } from '#imports'
import type { AdBanner } from '~/types/ad'
import type { Event } from '~/types/event'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'
import IconHeroiconsMegaphone20Solid from '~icons/heroicons/megaphone-20-solid'
import IconHeroiconsTag20Solid from '~icons/heroicons/tag-20-solid'
import IconHeroiconsCalendarDays20Solid from '~icons/heroicons/calendar-days-20-solid'
import IconHeroiconsMapPin20Solid from '~icons/heroicons/map-pin-20-solid'
import IconHeroiconsUserGroup20Solid from '~icons/heroicons/user-group-20-solid'
import {
  formatEventDate,
  formatEventLocation,
  formatEventMeta,
  formatEventType,
  getDescriptionSnippet,
  sanitizeMediaUrl,
} from '~/utils/format'
import { useCurrentYear } from '~/composables/useCurrentYear'

const { currentYear } = useCurrentYear()
const $img = useImage()

interface Props {
  featuredEvents?: Event[]
  banners?: AdBanner[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  featuredEvents: () => [],
  banners: () => [],
  isLoading: false,
})

const events = computed(() => props.featuredEvents ?? [])
const heroBanners = computed(() => props.banners ?? [])
const hasHeroContent = computed(
  () => !props.isLoading && (heroBanners.value.length > 0 || events.value.length > 0)
)

const splideOptions = {
  type: 'loop',
  autoplay: true,
  interval: 3000,
  pauseOnHover: true,
  arrows: false,
  pagination: true,
  speed: 800,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
}

defineExpose({
  events,
  heroBanners,
  hasHeroContent,
  splideOptions,
})

const buildHeroImageUrl = (
  src?: string | null,
  options: { width?: number; height?: number } = {}
) => {
  if (!src) return ''
  const sanitized = sanitizeMediaUrl(src)
  if (!sanitized) return ''
  return $img(sanitized, {
    width: options.width ?? 1920,
    height: options.height ?? 1080,
    format: 'webp',
    quality: 75,
  })
}

// NOTE: Preload link removed to prevent "preloaded but not used" warning
// The first slide image uses loading="eager" and fetchpriority="high" instead,
// which is sufficient for LCP optimization without causing preload warnings
</script>

<template>
  <section class="relative overflow-hidden min-h-screen lg:h-screen">
    <!-- SEO H1 (Hidden Visually) -->
    <h1 class="sr-only">
      Kalender Lari & Jadwal Marathon {{ currentYear }} Terlengkap di Indonesia
    </h1>

    <Splide
      v-if="hasHeroContent"
      :options="splideOptions"
      :has-track="false"
      class="hero-splide h-full"
    >
      <div class="splide__track h-full">
        <ul class="splide__list h-full">
          <SplideSlide class="h-full">
            <div
              class="relative flex min-h-screen lg:min-h-0 lg:h-full bg-primary text-white pt-16"
            >
              <img
                v-if="heroBanners.length > 0 && heroBanners[0]?.image"
                :src="buildHeroImageUrl(heroBanners[0]?.image)"
                :alt="heroBanners[0].name"
                class="absolute inset-0 h-full w-full object-cover"
                width="1920"
                height="1080"
                loading="eager"
                decoding="async"
                fetchpriority="high"
                sizes="100vw"
              >
              <div
                v-else
                class="absolute inset-0 h-full w-full bg-gradient-to-br from-primary via-primary/80 to-black"
              />
              <div class="absolute inset-0 bg-primary/70" />

              <div class="relative z-10 layout-container w-full h-full flex">
                <div
                  class="flex flex-1 flex-col items-center justify-center text-center space-y-8 max-w-3xl mx-auto py-10 lg:0"
                >
                  <span class="badge-modern inline-flex items-center gap-2">
                    <IconHeroiconsSparkles20Solid class="h-4 w-4" />
                    Platform Digital #1 Event Lari Indonesia
                  </span>

                  <div class="font-display text-3xl font-bold lg:text-6xl tracking-tighter leading-[1.4]">
                    Kalender Lari & Jadwal Marathon {{ currentYear }} Terlengkap di Indonesia
                  </div>

                  <p class="text-sm text-white/80 lg:text-base max-w-xl">
                    Jelajahi jadwal lari {{ currentYear }} terlengkap dari indonesiamarathon.com,
                    temukan event running favorit, fun run seru, dan ekosistem vendor lari.
                  </p>

                  <div class="flex flex-wrap justify-center gap-3">
                    <UiAppButton
                      to="/event"
                      size="lg"
                      variant="primary"
                      :icon="IconHeroiconsArrowRight20Solid"
                    >
                      Eksplor Agenda Lari
                    </UiAppButton>
                    <UiAppButton
                      to="/rate-card"
                      variant="outline"
                      size="lg"
                      :icon="IconHeroiconsMegaphone20Solid"
                    >
                      Lihat Promo Partner
                    </UiAppButton>
                  </div>
                </div>
              </div>
            </div>
          </SplideSlide>

          <SplideSlide
            v-for="(event, index) in events"
            :key="event.id ?? index"
            class="h-full"
          >
            <div
              class="relative flex min-h-screen lg:min-h-0 lg:h-full bg-primary text-white pt-16"
            >
              <img
                v-if="event.image"
                :src="buildHeroImageUrl(event.image)"
                :alt="event.title"
                class="absolute inset-0 h-full w-full object-cover"
                width="1920"
                height="1080"
                :loading="index === 0 ? 'eager' : 'lazy'"
                decoding="async"
                :fetchpriority="index === 0 ? 'high' : 'low'"
              >
              <div
                v-else
                class="absolute inset-0 h-full w-full bg-gradient-to-br from-primary via-primary/80 to-black"
              />
              <div class="absolute inset-0 bg-primary/70" />

              <div class="relative z-10 layout-container py-10 md:py-12 lg:py-16">
                <div class="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-between">
                  <div class="space-y-6 max-w-2xl">
                    <span class="badge-modern inline-flex items-center gap-2">
                      <IconHeroiconsTag20Solid class="h-4 w-4" />
                      {{ formatEventType(event.event_type) }}
                    </span>

                    <h2 class="text-3xl font-bold lg:text-4xl tracking-tighter leading-[1.4]">
                      {{ event.title }}
                    </h2>

                    <p class="text-base text-white/80 max-w-2xl line-clamp-3">
                      {{ getDescriptionSnippet(event.description) }}
                    </p>

                    <div class="hidden lg:flex">
                      <UiAppButton
                        :to="`/event/${event.slug}`"
                        size="md"
                        variant="primary"
                        :icon="IconHeroiconsArrowRight20Solid"
                      >
                        Lihat Detail Event
                      </UiAppButton>
                    </div>
                  </div>

                  <div class="w-full lg:w-[320px] xl:w-[360px]">
                    <div
                      class="group flex flex-row items-stretch lg:flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md h-full transition hover:border-secondary/70 hover:bg-white/15"
                    >
                      <div
                        class="relative w-32 flex-shrink-0 overflow-hidden lg:h-40 lg:w-full lg:flex-shrink-0"
                      >
                        <span class="badge-label absolute top-0 left-0 z-10 rounded-br-2xl">
                          <IconHeroiconsSparkles20Solid class="h-4 w-4" />
                          Event Pilihan
                        </span>
                        <img
                          v-if="event.image"
                          :src="buildHeroImageUrl(event.image, { width: 640, height: 400 })"
                          :alt="event.title"
                          class="absolute inset-0 h-full w-full object-cover"
                          width="640"
                          height="400"
                          loading="lazy"
                          decoding="async"
                        >
                        <div
                          v-else
                          class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/80 via-primary/70 to-black/80 text-center text-xs text-white/60 lg:rounded-t-2xl"
                        >
                          Poster event belum tersedia
                        </div>
                      </div>

                      <div
                        class="flex flex-1 flex-col justify-between gap-4 p-4 lg:p-5 text-sm text-white/90"
                      >
                        <div class="space-y-3">
                          <div class="flex items-center gap-2.5">
                            <IconHeroiconsCalendarDays20Solid
                              class="h-5 w-5 flex-shrink-0 text-secondary"
                            />
                            <span class="font-medium">{{ formatEventDate(event.event_date) }}</span>
                          </div>
                          <div class="flex items-center gap-2.5">
                            <IconHeroiconsMapPin20Solid
                              class="h-5 w-5 flex-shrink-0 text-secondary"
                            />
                            <span class="font-medium line-clamp-1">{{
                              formatEventLocation(event)
                            }}</span>
                          </div>
                          <div class="flex items-center gap-2.5">
                            <IconHeroiconsUserGroup20Solid
                              class="h-5 w-5 flex-shrink-0 text-secondary"
                            />
                            <span class="font-medium line-clamp-2">{{
                              formatEventMeta(event)
                            }}</span>
                          </div>
                        </div>

                        <UiAppButton
                          :to="`/event/${event.slug}`"
                          size="sm"
                          variant="primary"
                          class="lg:hidden"
                          block
                          :icon="IconHeroiconsArrowRight20Solid"
                        >
                          Lihat Detail Event
                        </UiAppButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SplideSlide>
        </ul>
      </div>
    </Splide>
    <div
      v-else
      class="relative flex min-h-screen lg:min-h-0 lg:h-full flex-col items-center justify-center bg-gradient-to-br from-primary via-primary to-black text-white pt-16"
    >
      <div class="w-full max-w-5xl space-y-6 px-6">
        <div class="h-8 w-60 rounded-full skeleton-shine mx-auto" />
        <div class="h-16 max-w-2xl rounded-lg skeleton-shine mx-auto" />
        <div class="h-5 max-w-xl rounded-lg skeleton-shine mx-auto" />
        <div class="flex justify-center flex-col gap-3 sm:flex-row">
          <div class="h-12 w-40 rounded-lg skeleton-shine" />
          <div class="h-12 w-40 rounded-lg skeleton-shine" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="postcss">
:deep(.hero-splide .splide__pagination) {
  @apply absolute top-0 right-0 translate-y-[-45%] translate-x-[30%] lg:translate-y-[-40%] lg:translate-x-[40%] flex gap-1.5 z-30;
}

:deep(.hero-splide .splide__pagination__page) {
  @apply lg:h-2.5 lg:w-2.5 h-2 w-2 rounded-full bg-white/40 transition duration-300;
}

:deep(.hero-splide .splide__pagination__page.is-active) {
  @apply w-6 rounded-full bg-secondary;
}

/* Override default line-height for hero titles */
:deep(.hero-splide h1),
:deep(.hero-splide .text-3xl) {
  line-height: 1.1 !important;
}

/* Pagination limit: only show active and immediate neighbors */
:deep(.hero-splide .splide__pagination li) {
  display: none;
}

:deep(.hero-splide .splide__pagination li:has(.is-active)),
:deep(.hero-splide .splide__pagination li:has(.is-active) + li),
:deep(.hero-splide .splide__pagination li:has(+ li .is-active)) {
  display: block;
}
</style>
