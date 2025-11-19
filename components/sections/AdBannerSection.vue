<script setup lang="ts">
import { computed } from 'vue'
import { useImage } from '#imports'
import type { AdBanner } from '~/types/ad'
import { sanitizeMediaUrl } from '~/utils/format'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'

interface Props {
  banners: AdBanner[]
  bannersMobile?: AdBanner[]
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  banners: () => [],
  bannersMobile: () => [],
  title: undefined,
  description: undefined,
})

const sectionTitle = computed(() => props.title || 'Penawaran Spesial dari Partner')
const sectionDescription = computed(
  () =>
    props.description ||
    'Temukan penawaran eksklusif dari partner terpercaya komunitas lari. Hemat untuk persiapan event lari terbaik kamu.'
)

const desktopBanners = computed(() => props.banners ?? [])
const mobileBanners = computed(() =>
  props.bannersMobile && props.bannersMobile.length > 0 ? props.bannersMobile : desktopBanners.value
)

const mainBanners = computed(() =>
  desktopBanners.value.filter(banner => banner.slot_location === 'banner_main')
)

const sidebar1Banners = computed(() =>
  desktopBanners.value.filter(banner => banner.slot_location === 'sidebar_1')
)

const sidebar2Banners = computed(() =>
  desktopBanners.value.filter(banner => banner.slot_location === 'sidebar_2')
)

const sidebarSlots = computed(() => [
  { label: 'Sidebar 1', banners: sidebar1Banners.value },
  { label: 'Sidebar 2', banners: sidebar2Banners.value },
])

const desktopCombinedBanners = computed(() => [
  ...mainBanners.value,
  ...sidebar1Banners.value,
  ...sidebar2Banners.value,
])

const mobileCombinedBanners = computed(() =>
  mobileBanners.value.length > 0 ? mobileBanners.value : desktopCombinedBanners.value
)

const hasDesktopBanners = computed(() => desktopCombinedBanners.value.length > 0)
const singleMainBanner = computed(() => mainBanners.value[0] ?? null)

const baseSliderOptions = {
  type: 'loop',
  pagination: true,
  arrows: false,
  autoplay: true,
  interval: 5000,
  pauseOnHover: true,
}

const desktopMainSliderOptions = {
  ...baseSliderOptions,
  gap: '1.5rem',
}

const desktopSidebarSliderOptions = {
  ...baseSliderOptions,
  gap: '1rem',
}

const mobileSliderOptions = {
  ...baseSliderOptions,
  gap: '1rem',
}

const mainBannerHeightClass = 'min-h-[420px]'
const sidebarBannerHeightClass = 'min-h-[200px]'

const $img = useImage()

const buildBannerImage = (src?: string | null, options: { width?: number; height?: number } = {}) => {
  const sanitized = sanitizeMediaUrl(src)
  if (!sanitized) return ''
  return $img(sanitized, {
    width: options.width ?? 1600,
    height: options.height ?? 600,
    format: 'webp',
    quality: 80,
  })
}

defineExpose({
  sectionTitle,
  sectionDescription,
  mainBanners,
  sidebarSlots,
  desktopCombinedBanners,
  mobileCombinedBanners,
  hasDesktopBanners,
  singleMainBanner,
  desktopMainSliderOptions,
  desktopSidebarSliderOptions,
  mobileSliderOptions,
  mainBannerHeightClass,
  sidebarBannerHeightClass,
})
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
            Kolaborasi Partner
          </span>
          <h2
            class="mt-4 text-xl font-bold text-primary tracking-tighter leading-tight lg:text-2xl mb-2"
          >
            {{ sectionTitle }}
          </h2>
          <p class="text-sm leading-relaxed text-gray-600 lg:text-base">
            {{ sectionDescription }}
          </p>
        </div>
      </div>

      <div
        v-if="hasDesktopBanners"
        class="grid grid-cols-1 gap-4 lg:grid-cols-[2fr,1fr]"
      >
        <div class="hidden h-full min-h-[420px] flex-col gap-4 lg:flex">
          <div class="flex h-full flex-col">
            <div
              v-if="mainBanners.length > 1"
              class="h-full"
            >
              <Splide
                :options="desktopMainSliderOptions"
                class="ad-banner-splide h-full"
              >
                <SplideSlide
                  v-for="banner in mainBanners"
                  :key="`main-${banner.id}`"
                  class="h-full"
                >
                  <NuxtLink
                    :to="banner.target_url"
                    external
                    target="_blank"
                    rel="noopener"
                    class="group flex h-full overflow-hidden rounded-2xl border border-secondary/50 bg-surface/90"
                  >
                    <img
                      v-if="banner.image"
                      :src="buildBannerImage(banner.image, { width: 1920, height: 640 })"
                      :alt="banner.name"
                      class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                      decoding="async"
                      width="1920"
                      height="640"
                    />
                    <div
                      v-else
                      :class="`flex h-full ${mainBannerHeightClass} items-center justify-center bg-primary text-white`"
                    >
                      <span class="text-lg font-semibold tracking-tight">{{ banner.name }}</span>
                    </div>
                  </NuxtLink>
                </SplideSlide>
              </Splide>
            </div>

            <div
              v-else
              class="h-full"
            >
              <NuxtLink
                v-if="singleMainBanner"
                :to="singleMainBanner.target_url"
                external
                target="_blank"
                rel="noopener"
                class="group flex h-full overflow-hidden rounded-2xl border border-secondary/50 bg-surface/90"
              >
                <img
                  v-if="singleMainBanner.image"
                  :src="buildBannerImage(singleMainBanner.image, { width: 1920, height: 640 })"
                  :alt="singleMainBanner.name"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                  width="1920"
                  height="640"
                />
                <div
                  v-else
                  :class="`flex h-full ${mainBannerHeightClass} items-center justify-center bg-primary text-white`"
                >
                  <span class="text-lg font-semibold tracking-tight">{{
                    singleMainBanner.name
                  }}</span>
                </div>
              </NuxtLink>

              <div
                v-else
                class="flex h-full items-center justify-center rounded-2xl border border-dashed border-secondary/40 bg-white/80 text-center text-sm text-gray-500"
              >
                Banner utama belum tersedia.
              </div>
            </div>
          </div>
        </div>

        <div class="hidden h-full min-h-[420px] gap-4 lg:grid lg:grid-rows-2">
          <div
            v-for="(slot, index) in sidebarSlots"
            :key="index"
            class="flex h-full flex-col"
          >
            <div
              v-if="slot.banners.length > 1"
              class="h-full"
            >
              <Splide
                :options="desktopSidebarSliderOptions"
                class="ad-banner-splide h-full"
              >
                <SplideSlide
                  v-for="banner in slot.banners"
                  :key="`sidebar-${index}-${banner.id}`"
                  class="h-full"
                >
                  <NuxtLink
                    :to="banner.target_url"
                    external
                    target="_blank"
                    rel="noopener"
                    class="group flex h-full overflow-hidden rounded-2xl border border-secondary/40 bg-white/95"
                  >
                    <img
                      v-if="banner.image"
                      :src="buildBannerImage(banner.image, { width: 900, height: 400 })"
                      :alt="banner.name"
                      class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                      decoding="async"
                      width="900"
                      height="400"
                    />
                    <div
                      v-else
                      :class="`flex h-full ${sidebarBannerHeightClass} items-center justify-center bg-primary text-white`"
                    >
                      <span class="text-sm font-semibold tracking-tight">{{ banner.name }}</span>
                    </div>
                  </NuxtLink>
                </SplideSlide>
              </Splide>
            </div>

            <div
              v-else-if="slot.banners.length === 1"
              class="h-full"
            >
              <NuxtLink
                :to="slot.banners[0]?.target_url ?? '#'"
                external
                target="_blank"
                rel="noopener"
                class="group flex h-full overflow-hidden rounded-2xl border border-secondary/40 bg-white/95"
              >
                <img
                  v-if="slot.banners[0]?.image"
                  :src="buildBannerImage(slot.banners[0]!.image, { width: 900, height: 400 })"
                  :alt="slot.banners[0]?.name ?? 'Banner Promo'"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                  width="900"
                  height="400"
                />
                <div
                  v-else
                  :class="`flex h-full ${sidebarBannerHeightClass} items-center justify-center bg-primary text-white`"
                >
                  <span class="text-sm font-semibold tracking-tight">{{
                    slot.banners[0]?.name ?? 'Banner Promo'
                  }}</span>
                </div>
              </NuxtLink>
            </div>

            <div
              v-else
              class="flex h-full items-center justify-center rounded-2xl border border-dashed border-secondary/30 bg-white/70 text-center text-xs text-gray-500"
            >
              Slot {{ slot.label }} belum terisi.
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="mobileCombinedBanners.length"
        class="lg:hidden"
      >
        <Splide
          :options="mobileSliderOptions"
          class="ad-banner-splide-mobile"
        >
          <SplideSlide
            v-for="banner in mobileCombinedBanners"
            :key="`mobile-${banner.id}`"
          >
            <NuxtLink
              :to="banner.target_url"
              external
              target="_blank"
              rel="noopener"
              class="group block overflow-hidden rounded-2xl border border-secondary/50 bg-surface/90"
            >
              <img
                v-if="banner.image"
                :src="buildBannerImage(banner.image, { width: 1200, height: 720 })"
                :alt="banner.name"
                class="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
                width="1200"
                height="720"
              />
              <div
                v-else
                class="flex h-72 items-center justify-center bg-primary text-white"
              >
                <span class="text-lg font-semibold tracking-tight">{{ banner.name }}</span>
              </div>
            </NuxtLink>
          </SplideSlide>
        </Splide>
      </div>

      <div
        v-if="!hasDesktopBanners && mobileCombinedBanners.length === 0"
        class="rounded-2xl border border-dashed border-secondary/40 bg-white/80 px-6 py-12 text-center text-gray-500"
      >
        Belum ada banner promo yang aktif saat ini.
      </div>
    </div>
  </section>
</template>

<style scoped lang="postcss">
.ad-banner-splide {
  @apply relative h-full pb-8;
}

.ad-banner-splide :deep(.splide__track),
.ad-banner-splide :deep(.splide__list),
.ad-banner-splide :deep(.splide__slide) {
  @apply h-full;
}

.ad-banner-splide :deep(.splide__pagination) {
  @apply absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-4 flex gap-2;
}

.ad-banner-splide :deep(.splide__pagination__page) {
  @apply h-2 w-2 rounded-full bg-primary/15 transition duration-300;
}

.ad-banner-splide :deep(.splide__pagination__page.is-active) {
  @apply w-8 rounded-full bg-secondary;
}

.ad-banner-splide-mobile {
  @apply relative pb-8;
}

.ad-banner-splide-mobile :deep(.splide__track),
.ad-banner-splide-mobile :deep(.splide__list),
.ad-banner-splide-mobile :deep(.splide__slide) {
  @apply h-full;
}

.ad-banner-splide-mobile :deep(.splide__pagination) {
  @apply absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-4 flex gap-2;
}

.ad-banner-splide-mobile :deep(.splide__pagination__page) {
  @apply h-2 w-2 rounded-full bg-primary/15 transition duration-300;
}

.ad-banner-splide-mobile :deep(.splide__pagination__page.is-active) {
  @apply w-8 rounded-full bg-secondary;
}
</style>
