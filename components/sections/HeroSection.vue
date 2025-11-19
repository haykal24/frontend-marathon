<script setup lang="ts">
import { computed } from 'vue'
import type { AdBanner } from '~/types/ad'
import type { Event } from '~/types/event'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'
import IconHeroiconsMegaphone20Solid from '~icons/heroicons/megaphone-20-solid'
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
  autoplay: false,
  interval: 6000,
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
</script>

<template>
  <section class="relative overflow-hidden min-h-screen lg:h-screen">
    <Splide
      v-if="hasHeroContent"
      :options="splideOptions"
      class="hero-splide h-full"
      :has-track="false"
    >
      <div class="splide__track h-full">
        <ul class="splide__list h-full">
          <SplideSlide class="h-full">
            <div
              class="relative flex min-h-screen lg:min-h-0 lg:h-full bg-primary text-white pt-16"
            >
              <NuxtImg
                v-if="heroBanners.length > 0 && heroBanners[0]?.image"
                :src="sanitizeMediaUrl(heroBanners[0]?.image)"
                :alt="heroBanners[0].name"
                class="absolute inset-0 h-full w-full object-cover"
                sizes="100vw"
                format="webp"
                loading="eager"
              />
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

                  <h1 class="text-3xl font-bold lg:text-6xl tracking-tighter leading-[1.4]">
                    Kalender Lari & Jadwal Marathon {{ currentYear }} Terlengkap di Indonesia
                  </h1>

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
            v-for="event in events"
            :key="event.id"
            class="h-full"
          >
            <div
              class="relative flex min-h-screen lg:min-h-0 lg:h-full bg-primary text-white pt-16"
            >
              <NuxtImg
                v-if="event.image"
                :src="sanitizeMediaUrl(event.image)"
                :alt="event.title"
                class="absolute inset-0 h-full w-full object-cover"
                format="webp"
                sizes="100vw"
                loading="eager"
              />
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
                        class="relative w-32 min-h-[7rem] flex-shrink-0 overflow-hidden h-full lg:h-40 lg:w-full lg:flex-shrink-0"
                      >
                        <span class="badge-label absolute top-0 left-0 rounded-br-2xl">
                          <IconHeroiconsSparkles20Solid class="h-4 w-4" />
                          Event Pilihan
                        </span>
                        <NuxtImg
                          v-if="event.image"
                          :src="sanitizeMediaUrl(event.image)"
                          :alt="event.title"
                          class="h-full w-full object-cover"
                          format="webp"
                          sizes="(max-width: 1024px) 50vw, 320px"
                          loading="lazy"
                        />
                        <div
                          v-else
                          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 via-primary/70 to-black/80 text-center text-xs text-white/60 lg:rounded-t-2xl"
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
:deep(.hero-splide h1) {
  line-height: 1.1 !important;
}
</style>
