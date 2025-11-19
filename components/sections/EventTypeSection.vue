<script setup lang="ts">
import { computed } from 'vue'
import type { EventType, Event } from '~/types/event'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import { formatEventDate, formatEventLocation } from '~/utils/format'
import { useCurrentYear } from '~/composables/useCurrentYear'

const { currentYear } = useCurrentYear()

interface Props {
  eventTypes: EventType[]
  eventsByType?: Record<string, Event[]>
}

const props = defineProps<Props>()

const eventTypes = computed(() => props.eventTypes ?? [])
const eventsByType = computed(() => props.eventsByType ?? {})

const eventTypesWithEvents = computed(() =>
  eventTypes.value.filter(type => (eventsByType.value?.[type.slug]?.length ?? 0) > 0),
)

const getTypeLabel = (slug: string) => {
  const type = eventTypes.value.find((t: EventType) => t.slug === slug)
  return type?.name || slug
}

const getSampleEvents = (slug: string) => (eventsByType.value?.[slug] ?? []).slice(0, 2)

const getEventCount = (slug: string) => eventsByType.value?.[slug]?.length ?? 0

const sliderOptions = {
  type: 'loop',
  perPage: 1,
  perMove: 1,
  gap: '1.5rem',
  padding: { left: '0', right: '20%' },
  focus: 'left',
  pagination: true,
  arrows: false,
  autoplay: false,
  drag: true,
  snap: true,
  speed: 600,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  breakpoints: {
    768: {
      perPage: 1,
      gap: '1rem',
      padding: { left: '0', right: '15%' },
    },
    1024: {
      perPage: 2,
      gap: '1.25rem',
      padding: { left: '0', right: '15%' },
    },
    1280: {
      perPage: 3,
      gap: '1.5rem',
      padding: { left: '0', right: '10%' },
    },
  },
}
</script>

<template>
  <section class="bg-surface py-10">
    <div class="layout-container">
      <div
        class="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-4"
      >
        <div class="max-w-4xl">
          <span class="badge-modern inline-flex items-center gap-2 w-fit">
            <IconHeroiconsSparkles20Solid class="h-4 w-4" />
            Kurasi Jenis Event
          </span>
          <h2
            class="text-xl lg:text-2xl font-bold text-primary tracking-tighter leading-tight mt-4 mb-2"
          >
            Dari Fun Run Santai hingga Marathon Penuh Tantangan
          </h2>
          <p class="text-sm lg:text-base text-gray-600 leading-relaxed">
            Pilih kategori running event {{ currentYear }} favoritmu: temukan jadwal trail run
            terdekat, half marathon berikutnya, atau fun run di kotamu.
          </p>
        </div>
        <UiAppButton
          to="/event"
          variant="primary"
          size="sm"
          class="self-start lg:w-auto"
          :icon="IconHeroiconsArrowRight20Solid"
        >
          Lihat Semua
        </UiAppButton>
      </div>

      <Splide
        v-if="eventTypesWithEvents.length > 0"
        :options="sliderOptions"
        class="event-type-splide"
      >
        <SplideSlide
          v-for="eventType in eventTypesWithEvents"
          :key="eventType.id"
          class="h-full"
        >
          <NuxtLink
            :to="`/event?type=${eventType.slug}`"
            class="flex h-full flex-col overflow-hidden rounded-2xl border border-secondary/80 bg-white/85"
          >
            <div class="relative h-52 overflow-hidden">
              <NuxtImg
                v-if="eventType.image"
                :src="eventType.image"
                :alt="eventType.name"
                class="h-full w-full object-cover"
                preset="card"
                width="500"
                height="350"
                format="webp"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/70 to-black text-white"
              >
                <span class="text-lg font-semibold tracking-wider uppercase">{{
                  eventType.name
                }}</span>
              </div>
              <div
                class="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-primary/85 via-primary/55 to-transparent px-5 pb-5 pt-16 text-white"
              >
                <span class="badge-modern inline-flex items-center gap-2">
                  <IconHeroiconsTag20Solid class="h-4 w-4" />
                  {{ getTypeLabel(eventType.slug) }}
                </span>
                <span class="text-sm font-semibold uppercase tracking-[0.18em]">
                  {{ getEventCount(eventType.slug) }} Event
                </span>
              </div>
            </div>

            <div class="flex flex-1 flex-col gap-4 p-5 md:p-6">
              <div class="space-y-2">
                <div
                  v-for="event in getSampleEvents(eventType.slug)"
                  :key="event.id"
                  class="rounded-2xl border border-secondary/40 bg-surface/90 p-4 backdrop-blur-sm"
                >
                  <p class="text-sm font-semibold text-primary leading-snug line-clamp-2">
                    {{ event.title }}
                  </p>
                  <div class="mt-3 flex flex-col gap-1.5 text-sm text-gray-600">
                    <span class="inline-flex items-center gap-2">
                      <IconHeroiconsCalendarDays20Solid class="h-4 w-4 text-secondary" />
                      <span class="font-medium">
                        {{
                          event.event_date
                            ? formatEventDate(event.event_date)
                            : 'Tanggal akan diumumkan'
                        }}
                      </span>
                    </span>
                    <span class="inline-flex items-center gap-2">
                      <IconHeroiconsMapPin20Solid class="h-4 w-4 text-secondary" />
                      <span class="font-medium line-clamp-1">
                        {{ formatEventLocation(event) }}
                      </span>
                    </span>
                  </div>
                </div>
                <div
                  v-if="!getSampleEvents(eventType.slug).length"
                  class="rounded-2xl border border-dashed border-secondary/40 bg-surface/80 px-4 py-6 text-center text-xs text-gray-500"
                >
                  Jadwal terbaru segera hadir. Pantau terus.
                </div>
              </div>

              <UiAppButton
                :to="`/event?type=${eventType.slug}`"
                variant="primary"
                size="sm"
                class="mt-auto w-full md:w-auto"
                :icon="IconHeroiconsArrowRight20Solid"
              >
                Lihat Semua {{ eventType.name }}
              </UiAppButton>
            </div>
          </NuxtLink>
        </SplideSlide>
      </Splide>

      <div
        v-else
        class="rounded-2xl border border-dashed border-secondary/40 bg-white/70 py-10 text-center text-sm text-gray-500"
      >
        Belum ada data jenis event dengan acara terbaru saat ini.
      </div>
    </div>
  </section>
</template>

<style scoped lang="postcss">
.event-type-splide {
  @apply relative pb-8;
}

.event-type-splide :deep(.splide__pagination) {
  @apply absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-4 flex gap-2;
}

.event-type-splide :deep(.splide__pagination__page) {
  @apply h-2 w-2 rounded-full bg-primary/15 transition duration-300;
}

.event-type-splide :deep(.splide__pagination__page.is-active) {
  @apply w-8 rounded-full bg-secondary;
}
</style>
