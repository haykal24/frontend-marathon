<script setup lang="ts">
import { computed } from 'vue'
import { useImage } from '#imports'
import type { Province } from '~/types/event'
import { useCurrentYear } from '~/composables/useCurrentYear'

interface Props {
  provinces: Province[]
}

const props = defineProps<Props>()

const { currentYear } = useCurrentYear()
const $img = useImage()
const provinces = computed(() => props.provinces ?? [])

const buildProvinceImage = (src?: string | null) => {
  if (!src) return ''
  return $img(src, {
    width: 1200,
    height: 800,
    format: 'webp',
    quality: 80,
  })
}
</script>

<template>
  <section class="bg-surface py-10">
    <div class="layout-container">
      <div class="max-w-4xl mb-6 lg:mb-4">
        <span class="badge-modern inline-flex items-center gap-2 w-fit">
          <IconHeroiconsMapPin20Solid class="h-4 w-4" />
          Cari Event Lari Lokal
        </span>
        <h2
          class="mt-4 text-xl lg:text-2xl font-bold text-primary tracking-tighter leading-tight mb-2"
        >
          Event Lari di Berbagai Provinsi Indonesia
        </h2>
        <p class="text-sm lg:text-base text-gray-600 leading-relaxed">
          Temukan event running terbaru di provinsi pilihan kamu. Daftar sekarang dan bergabung
          dengan ribuan pelari lainnya di event favorit {{ currentYear }}.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <NuxtLink
          v-for="province in provinces"
          :key="province.id"
          :to="`/event?province=${province.slug}`"
          class="group relative h-64 overflow-hidden rounded-2xl bg-primary"
        >
          <img
            v-if="province.thumbnail"
            :src="buildProvinceImage(province.thumbnail)"
            :alt="province.name"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            width="1200"
            height="800"
          >
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-black text-center text-white"
          >
            <span class="text-lg font-semibold tracking-tight">{{ province.name }}</span>
          </div>

          <div
            class="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-transparent"
          />
          <div class="absolute inset-0 flex flex-col justify-between p-5 text-white">
            <span class="badge-modern inline-flex items-center gap-2 self-start">
              <IconHeroiconsSparkles20Solid class="h-4 w-4" />
              Favorit
            </span>
            <div>
              <h2 class="text-xl font-semibold tracking-tight">
                {{ province.name }}
              </h2>
              <p class="text-sm text-white/80">
                {{ province.event_count ?? 0 }} event tersedia
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="postcss">
a {
  @apply outline-none focus-visible:ring-2 focus-visible:ring-secondary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface;
}
</style>
