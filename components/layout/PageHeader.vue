<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useImage } from '#imports'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import LayoutBreadcrumb from '~/components/layout/Breadcrumb.vue'
import type { AdBanner } from '~/types/ad'
import { sanitizeMediaUrl } from '~/utils/format'

interface Props {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  backgroundImageUrl?: string | null
  adBanners?: AdBanner[]
  adBannersMobile?: AdBanner[]
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  breadcrumbs: () => [],
  backgroundImageUrl: '',
  adBanners: () => [],
  adBannersMobile: () => [],
})

const { title, description, breadcrumbs } = toRefs(props)
const $img = useImage()

const desktopBanners = computed(() => props.adBanners || [])
const mobileBanners = computed(() => {
  if (props.adBannersMobile && props.adBannersMobile.length > 0) {
    return props.adBannersMobile
  }
  return desktopBanners.value
})

const hasDesktopBanners = computed(() => desktopBanners.value.length > 0)
const hasMobileBanners = computed(() => mobileBanners.value.length > 0)
const hasAnyBanners = computed(() => hasDesktopBanners.value || hasMobileBanners.value)
const areBannersIdentical = computed(() => mobileBanners.value === desktopBanners.value)

const headerBgUrl = computed(() =>
  props.backgroundImageUrl ? sanitizeMediaUrl(props.backgroundImageUrl) : null
)

const sliderOptions = {
  type: 'loop',
  autoplay: true,
  interval: 4000,
  pauseOnHover: true,
  arrows: false,
  pagination: true,
  speed: 700,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
}

const buildBannerImage = (src?: string | null, options: { width?: number; height?: number } = {}) => {
  if (!src) return ''
  const sanitized = sanitizeMediaUrl(src)
  if (!sanitized) return ''
  return $img(sanitized, {
    width: options.width ?? 1920,
    height: options.height ?? 1080,
    format: 'webp',
    quality: 80,
  })
}
</script>

<template>
  <!-- SEO H1 (Hidden Visually) -->
  <h1 class="sr-only">
    {{ title }}
  </h1>

  <!-- Desktop / Unified Slider -->
  <!-- Jika banner identik, tampilkan slider ini di semua device (block). Jika beda, hanya di desktop (hidden lg:block). -->
  <div
    v-if="hasDesktopBanners"
    :class="[
      areBannersIdentical ? 'block' : 'hidden lg:block',
      'h-[60vh] overflow-hidden'
    ]"
  >
    <Splide
      :key="`splide-desktop-${desktopBanners.length}`"
      :options="sliderOptions"
      class="h-full"
      :has-track="false"
    >
      <div class="splide__track h-full">
        <ul class="splide__list h-full">
          <SplideSlide class="h-full">
            <div
              class="page-header-overlay relative h-full w-full bg-primary bg-cover bg-center flex flex-col justify-center overflow-hidden"
              :style="headerBgUrl ? { backgroundImage: `url('${headerBgUrl}')` } : {}"
            >
              <div class="absolute inset-0 bg-primary/70" />
              <div class="relative z-10 w-full h-full flex flex-col justify-center">
                <div class="layout-container text-center text-white">
                  <div class="font-display text-2xl lg:text-4xl font-bold tracking-tighter leading-[1.2] max-w-4xl mx-auto">
                    {{ title }}
                  </div>
                  <p
                    v-if="description"
                    class="mt-4 text-sm lg:text-base text-white/80 max-w-2xl mx-auto"
                  >
                    {{ description }}
                  </p>
                </div>
              </div>

              <div
                v-if="breadcrumbs && breadcrumbs.length > 0"
                class="absolute top-0 left-0 z-20"
              >
                <LayoutBreadcrumb
                  :items="breadcrumbs"
                  class="!py-4 !px-4 lg:!px-6 text-white/90 !bg-transparent"
                />
              </div>
            </div>
          </SplideSlide>

          <SplideSlide
            v-for="banner in desktopBanners"
            :key="`desktop-${banner.id}`"
            class="h-full"
          >
            <component
              :is="banner.target_url ? 'NuxtLink' : 'div'"
              :to="banner.target_url ? banner.target_url : undefined"
              :target="banner.target_url ? '_blank' : undefined"
              :rel="banner.target_url ? 'noopener' : undefined"
              class="h-full w-full overflow-hidden"
            >
              <img
                v-if="banner.image"
                :src="buildBannerImage(banner.image)"
                :alt="banner.name"
                class="h-full w-full object-cover"
                width="1920"
                height="1080"
                loading="lazy"
                decoding="async"
              >
              <div
                v-else
                class="h-full w-full bg-gradient-to-br from-primary via-primary/80 to-black flex items-center justify-center text-white text-center"
              >
                <span class="text-lg font-semibold">{{ banner.name }}</span>
              </div>
            </component>
          </SplideSlide>
        </ul>
      </div>

      <template #controls>
        <div class="splide__controls" />
      </template>
    </Splide>
  </div>
                  
  <!-- Mobile Only Slider (Only if banners differ) -->
  <div
    v-if="hasMobileBanners && !areBannersIdentical"
    class="lg:hidden h-[60vh] overflow-hidden"
  >
    <Splide
      :key="`splide-mobile-${mobileBanners.length}`"
      :options="sliderOptions"
      class="h-full"
      :has-track="false"
    >
      <div class="splide__track h-full">
        <ul class="splide__list h-full">
          <SplideSlide class="h-full">
            <div
              class="page-header-overlay relative h-full w-full bg-primary bg-cover bg-center flex flex-col justify-center overflow-hidden"
              :style="headerBgUrl ? { backgroundImage: `url('${headerBgUrl}')` } : {}"
            >
              <div class="absolute inset-0 bg-primary/70" />
              <div class="relative z-10 w-full h-full flex flex-col justify-center">
                <div class="layout-container text-center text-white">
                  <!-- Gunakan div class text-2xl (tampilan mirip h1) untuk menghindari duplicate h1 -->
                  <div class="font-display text-2xl lg:text-4xl font-bold tracking-tighter leading-[1.2] max-w-4xl mx-auto">
                    {{ title }}
                  </div>
                  <p
                    v-if="description"
                    class="mt-4 text-sm lg:text-base text-white/80 max-w-2xl mx-auto"
                  >
                    {{ description }}
                  </p>
                </div>
              </div>

              <div
                v-if="breadcrumbs && breadcrumbs.length > 0"
                class="absolute top-0 left-0 z-20"
              >
                <LayoutBreadcrumb
                  :items="breadcrumbs"
                  class="!py-4 !px-4 lg:!px-6 text-white/90 !bg-transparent"
                />
              </div>
            </div>
          </SplideSlide>

          <SplideSlide
            v-for="banner in mobileBanners"
            :key="`mobile-${banner.id}`"
            class="h-full"
          >
            <component
              :is="banner.target_url ? 'NuxtLink' : 'div'"
              :to="banner.target_url ? banner.target_url : undefined"
              :target="banner.target_url ? '_blank' : undefined"
              :rel="banner.target_url ? 'noopener' : undefined"
              class="h-full w-full overflow-hidden"
            >
              <img
                v-if="banner.image"
                :src="buildBannerImage(banner.image)"
                :alt="banner.name"
                class="h-full w-full object-cover"
                width="1920"
                height="1080"
                loading="lazy"
                decoding="async"
              >
              <div
                v-else
                class="h-full w-full bg-gradient-to-br from-primary via-primary/80 to-black flex items-center justify-center text-white text-center"
              >
                <span class="text-lg font-semibold">{{ banner.name }}</span>
              </div>
            </component>
          </SplideSlide>
        </ul>
      </div>

      <template #controls>
        <div class="splide__controls" />
      </template>
    </Splide>
  </div>

  <!-- Fallback hero -->
  <div
    v-if="!hasAnyBanners"
    class="page-header-overlay h-[60vh] relative w-full bg-primary bg-cover bg-center flex flex-col justify-center overflow-hidden"
    :style="headerBgUrl ? { backgroundImage: `url('${headerBgUrl}')` } : {}"
  >
    <div class="absolute inset-0 bg-primary/70" />
    <div class="relative z-10 w-full h-full flex flex-col justify-center">
      <div class="layout-container text-center text-white">
        <div class="font-display text-2xl lg:text-4xl font-bold tracking-tighter leading-[1.2] max-w-4xl mx-auto">
          {{ title }}
        </div>
        <p
          v-if="description"
          class="mt-4 text-sm lg:text-base text-white/80 max-w-2xl mx-auto"
        >
          {{ description }}
        </p>
      </div>
    </div>

    <div
      v-if="breadcrumbs && breadcrumbs.length > 0"
      class="absolute top-0 left-0 z-20"
    >
      <LayoutBreadcrumb
        :items="breadcrumbs"
        class="!py-4 !px-4 lg:!px-6 text-white/90 !bg-transparent"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
:deep(.splide__track),
:deep(.splide__list),
:deep(.splide__slide) {
  @apply h-full w-full;
}

:deep(.splide__pagination) {
  @apply absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 !important;
}

:deep(.splide__pagination__page) {
  @apply h-2.5 w-2.5 rounded-full bg-white/40 transition-all duration-300 cursor-pointer hover:bg-white/60 !important;
}

:deep(.splide__pagination__page.is-active) {
  @apply h-2.5 w-6 rounded-full bg-secondary !important;
}

/* Pagination limit: only show active and immediate neighbors */
:deep(.splide__pagination li) {
  display: none;
}

:deep(.splide__pagination li:has(.is-active)),
:deep(.splide__pagination li:has(.is-active) + li),
:deep(.splide__pagination li:has(+ li .is-active)) {
  display: block;
}
</style>
     