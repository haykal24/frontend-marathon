<script setup lang="ts">
import { computed } from 'vue'
import type { Event } from '~/types/event'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import { useCurrentYear } from '~/composables/useCurrentYear'

const { currentYear } = useCurrentYear()

interface Props {
  events: Event[]
  title?: string
  showViewAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Jadwal Lari & Event Running Terbaru',
  showViewAll: true,
})

const eventsList = computed(() => props.events ?? [])
const sectionTitle = computed(() => props.title)
const showViewAll = computed(() => props.showViewAll)

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
      perPage: 2,
      gap: '1.5rem',
      padding: { left: '0', right: '10%' },
    },
  },
}
</script>

<template>
  <section class="bg-white py-10">
    <div class="layout-container">
      <div
        class="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-4"
      >
        <div class="max-w-4xl">
          <span class="badge-modern inline-flex items-center gap-2 w-fit">
            <IconHeroiconsSparkles20Solid class="h-4 w-4" />
            Update Jadwal Lari Terbaru
          </span>
          <h2
            class="text-xl lg:text-2xl font-bold text-primary tracking-tighter leading-tight mt-4 mb-2"
          >
            {{ sectionTitle }}
          </h2>
          <p class="text-sm lg:text-base text-gray-600 leading-relaxed">
            Kalender lari ini terus di-update setiap hari. Cek event running
            {{ currentYear }} terbaru yang baru masuk dan tandai jadwalmu berikutnya.
          </p>
        </div>

        <UiAppButton
          v-if="showViewAll"
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
        v-if="eventsList.length > 0"
        :options="sliderOptions"
        class="event-latest-splide"
      >
        <SplideSlide
          v-for="event in eventsList"
          :key="event.id"
        >
          <NuxtLink
            :to="`/event/${event.slug}`"
            class="block h-full min-h-[280px]"
          >
            <EventCard
              :event="event"
              :show-cta="false"
              class="h-full min-h-[280px]"
            />
          </NuxtLink>
        </SplideSlide>
      </Splide>

      <div
        v-else
        class="rounded-2xl border border-dashed border-secondary/40 bg-white/70 py-10 text-center text-sm text-gray-500"
      >
        Belum ada event terbaru — pantau terus untuk pembaruan selanjutnya.
      </div>
    </div>
  </section>
</template>

<style scoped lang="postcss">
.event-latest-splide {
  @apply relative pb-8;
}

.event-latest-splide :deep(.splide__track) {
  @apply h-full;
}

.event-latest-splide :deep(.splide__list) {
  @apply h-full;
}

.event-latest-splide :deep(.splide__slide) {
  @apply h-auto;
}

.event-latest-splide :deep(.splide__pagination) {
  @apply absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-4 flex gap-2;
}

.event-latest-splide :deep(.splide__pagination__page) {
  @apply h-2 w-2 rounded-full bg-primary/15 transition duration-300;
}

.event-latest-splide :deep(.splide__pagination__page.is-active) {
  @apply w-8 rounded-full bg-secondary;
}
</style>
