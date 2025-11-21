<script setup lang="ts">
import { computed } from 'vue'
import { useImage } from '#imports'
import type { Event } from '~/types/event'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconHeroiconsCalendarDays20Solid from '~icons/heroicons/calendar-days-20-solid'
import IconHeroiconsMapPin20Solid from '~icons/heroicons/map-pin-20-solid'
import IconHeroiconsUserGroup20Solid from '~icons/heroicons/user-group-20-solid'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'
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
const $img = useImage()

// Check if event has valid image (not null, not empty, not placeholder)
const hasValidImage = computed(() => {
  const image = props.event.image || props.event.poster_webp_url
  if (!image) return false
  
  // Check if image is placeholder path
  const imageStr = String(image).toLowerCase()
  if (imageStr.includes('placeholder') || imageStr.includes('/images/placeholder')) {
    return false
  }
  
  return true
})

const buildCardImage = (src?: string | null) => {
  if (!src) return ''
  return $img(sanitizeMediaUrl(src), {
    width: 640,
    height: 420,
    format: 'webp',
    quality: 70,
  })
}
</script>

<template>
  <article
    :class="[
      'flex h-full overflow-hidden rounded-2xl transition-all duration-200',
      'flex flex-col lg:flex-row',
      containerToneClasses,
    ]"
  >
    <!-- Image atau Fallback dengan bg-primary (konsisten dengan EventTypeSection/BlogSection) -->
    <div
      :class="[
        'relative flex-shrink-0 overflow-hidden',
        'w-full aspect-[16/9] lg:w-[240px] lg:aspect-[4/5]',
      ]"
    >
      <!-- Favorite Badge - Event Pilihan Badge Label Style -->
      <!-- Image jika ada dan valid (tidak placeholder) -->
      <img
        v-if="hasValidImage"
        :src="buildCardImage(props.event.image || props.event.poster_webp_url)"
        :alt="props.event.title"
        class="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        width="800"
        height="600"
      />

      <!-- Fallback dengan bg-primary gradient (konsisten dengan EventTypeSection/BlogSection) -->
      <div
        v-else
        class="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/70 to-black p-4 text-center text-white"
      >
        <span class="text-sm font-semibold tracking-tight leading-snug z-10">
          {{ props.event.title }}
        </span>
      </div>
    </div>

    <div :class="['flex flex-1 flex-col justify-between gap-3 p-4', 'sm:p-5']">
      <div
        v-if="props.event.is_featured_hero"
        class="flex"
      >
        <span class="badge-modern inline-flex items-center justify-center gap-2 text-xs">
          <IconHeroiconsSparkles20Solid class="h-4 w-4" />
          Event Pilihan
        </span>
      </div>
      <h3
        class="text-primary font-semibold leading-snug line-clamp-2 text-base lg:text-lg"
      >
        {{ event.title }}
      </h3>

      <div class="space-y-1 text-xs sm:text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <IconHeroiconsCalendarDays20Solid class="h-4 w-4 text-secondary" />
          <span class="font-medium">{{ formatEventDate(event.event_date) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <IconHeroiconsMapPin20Solid class="h-4 w-4 text-secondary" />
          <span class="line-clamp-1 font-medium">{{ formatEventLocation(event) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <IconHeroiconsUserGroup20Solid class="h-4 w-4 text-secondary" />
          <span class="line-clamp-2 text-xs sm:text-sm font-medium text-primary/90">
            {{ formatEventMeta(event) }}
          </span>
        </div>
      </div>

      <p
        v-if="variant === 'default' && event.description"
        class="text-xs text-gray-500 leading-relaxed line-clamp-2"
      >
        {{ event.description }}
      </p>

      <div
        v-if="showCta"
        class="mt-auto flex justify-end"
      >
        <NuxtLink
          :to="`/event/${event.slug}`"
          class="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70 focus-visible:ring-offset-2"
        >
          <span>Lihat Detail Event</span>
          <IconHeroiconsArrowRight20Solid class="h-4 w-4" />
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
