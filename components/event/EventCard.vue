<script setup lang="ts">
import { computed } from 'vue'
import type { Event } from '~/types/event'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconHeroiconsCalendarDays20Solid from '~icons/heroicons/calendar-days-20-solid'
import IconHeroiconsMapPin20Solid from '~icons/heroicons/map-pin-20-solid'
import IconHeroiconsUserGroup20Solid from '~icons/heroicons/user-group-20-solid'
import {
  formatEventDate,
  formatEventLocation,
  formatEventMeta,
  sanitizeMediaUrl,
} from '~/utils/format'

const props = withDefaults(
  defineProps<{
    event: Event
    variant?: 'default' | 'compact'
    showCta?: boolean
    tone?: 'surface' | 'white'
  }>(),
  {
    variant: 'default',
    showCta: true,
    tone: 'surface',
  }
)

const containerToneClasses = computed(() => {
  if (props.tone === 'white') return 'border border-secondary bg-white'

  return 'border border-secondary bg-surface'
})
</script>

<template>
  <article
    :class="[
      'flex h-full overflow-hidden rounded-2xl transition-all duration-200',
      'flex-col sm:flex-row',
      containerToneClasses,
    ]"
  >
    <div
      v-if="props.event.image"
      :class="[
        'relative flex-shrink-0 overflow-hidden bg-primary/5',
        'w-full h-48 sm:w-[220px] sm:h-full',
      ]"
    >
      <!-- Favorite Badge - Event Pilihan Badge Label Style -->
      <div
        v-if="props.event.is_featured_hero"
        class="absolute top-0 left-0 z-10"
      >
        <div class="badge-label">
          <svg
            class="h-4 w-4 fill-current"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
          Event Pilihan
        </div>
      </div>

      <NuxtImg
        :src="sanitizeMediaUrl(props.event.image)"
        :alt="props.event.title"
        class="h-full w-full object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
        format="webp"
        loading="lazy"
      />
    </div>
    <div
      v-else
      :class="[
        'relative flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-black p-4 text-center text-white overflow-hidden',
        'w-full h-48 sm:w-[220px] sm:h-full',
      ]"
    >
      <span class="text-sm font-semibold tracking-tight leading-snug z-10">
        {{ props.event.title }}
      </span>
    </div>

    <div :class="['flex flex-1 flex-col justify-between gap-4 p-5', 'md:p-6']">
      <h3
        :class="[
          'text-primary font-semibold leading-snug line-clamp-2',
          props.variant === 'compact' ? 'text-base' : 'text-lg',
        ]"
      >
        {{ props.event.title }}
      </h3>

      <div class="space-y-1.5 text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <IconHeroiconsCalendarDays20Solid class="h-4 w-4 text-secondary" />
          <span class="font-medium">{{ formatEventDate(props.event.event_date) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <IconHeroiconsMapPin20Solid class="h-4 w-4 text-secondary" />
          <span class="line-clamp-1 font-medium">{{ formatEventLocation(props.event) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <IconHeroiconsUserGroup20Solid class="h-4 w-4 text-secondary" />
          <span class="line-clamp-2 text-sm font-medium text-primary/90">
            {{ formatEventMeta(props.event) }}
          </span>
        </div>
      </div>

      <p
        v-if="props.variant === 'default' && props.event.description"
        class="text-xs text-gray-500 leading-relaxed line-clamp-2"
      >
        {{ props.event.description }}
      </p>

      <div
        v-if="props.showCta"
        class="mt-auto flex justify-end"
      >
        <UiAppButton
          :to="`/event/${props.event.slug}`"
          variant="primary"
          size="sm"
          class="w-full sm:w-auto"
          :icon="IconHeroiconsArrowRight20Solid"
        >
          Lihat Detail Event
        </UiAppButton>
      </div>
    </div>
  </article>
</template>
