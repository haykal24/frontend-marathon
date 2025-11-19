<script setup lang="ts">
import { computed } from 'vue'
import type { AdBanner } from '~/types/ad'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconHeroiconsChatBubbleBottomCenterText20Solid from '~icons/heroicons/chat-bubble-bottom-center-text-20-solid'
import { sanitizeMediaUrl } from '~/utils/format'

interface Props {
  banner?: AdBanner | null
  title?: string
  description?: string
  ctaText?: string
  ctaLink?: string
}

const props = withDefaults(defineProps<Props>(), {
  banner: null,
  title: 'Naik kelas bersama indonesiamarathon.com',
  description:
    'Promosikan event lari Anda di platform #1 untuk running event di Indonesia. Ini alasan mengapa kami partner terbaik untuk pertumbuhan event Anda.',
  ctaText: 'Lihat Rate Card',
  ctaLink: '/rate-card',
})

const title = computed(() => props.title)
const description = computed(() => props.description)
const ctaText = computed(() => props.ctaText)
const ctaLink = computed(() => props.ctaLink)
const banner = computed(() => props.banner ?? null)

const hasCustomBanner = computed(() => Boolean(banner.value?.image))
const bannerImage = computed(() => sanitizeMediaUrl(banner.value?.image))

defineExpose({
  title,
  description,
  ctaText,
  ctaLink,
  banner,
  hasCustomBanner,
  bannerImage,
})
</script>

<template>
  <section class="relative overflow-hidden bg-primary text-white py-10">
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(190,242,0,0.15),transparent_55%)]"
    />
    <div
      class="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.35),rgba(18,18,18,0.85))]"
    />

    <div class="layout-container relative z-10">
      <div class="grid gap-12 lg:grid-cols-[1.4fr,1fr] lg:items-center">
        <div class="space-y-8 text-center lg:text-left">
          <span class="badge-modern inline-flex items-center justify-center gap-2 lg:justify-start">
            <IconHeroiconsSparkles20Solid class="h-4 w-4" />
            Kolaborasi Dengan Kami
          </span>

          <div class="space-y-4">
            <h2 class="text-2xl font-bold tracking-tighter leading-[1.4] lg:text-4xl">
              {{ title }}
            </h2>
            <p class="mx-auto max-w-2xl text-sm leading-relaxed text-white/75 lg:mx-0 lg:text-base">
              {{ description }}
            </p>
          </div>

          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <UiAppButton
              :to="ctaLink"
              variant="primary"
              size="lg"
              :icon="IconHeroiconsArrowRight20Solid"
            >
              {{ ctaText }}
            </UiAppButton>
            <UiAppButton
              to="/kontak"
              variant="outline"
              size="lg"
              class="border-white text-white hover:text-primary"
              :icon="IconHeroiconsChatBubbleBottomCenterText20Solid"
            >
              Hubungi Tim Kami
            </UiAppButton>
          </div>

          <div class="grid grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
            <div class="rounded-2xl bg-white/10 p-5 text-center backdrop-blur">
              <p class="text-2xl lg:text-3xl font-bold text-secondary">
                10K+
              </p>
              <p class="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                Pelari Terdaftar
              </p>
            </div>
            <div class="rounded-2xl bg-white/10 p-5 text-center backdrop-blur">
              <p class="text-2xl lg:text-3xl font-bold text-secondary">
                1500+
              </p>
              <p class="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                Event Terdaftar
              </p>
            </div>
            <div class="rounded-2xl bg-white/10 p-5 text-center backdrop-blur">
              <p class="text-2xl lg:text-3xl font-bold text-secondary">
                30+
              </p>
              <p class="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                Provinsi
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="hasCustomBanner"
          class="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-1 backdrop-blur"
        >
          <NuxtLink
            v-if="banner?.target_url"
            :to="banner?.target_url"
            class="block rounded-[calc(theme(borderRadius.3xl)-4px)] overflow-hidden"
          >
            <NuxtImg
              v-if="bannerImage"
              :src="bannerImage"
              :alt="banner?.name ?? 'Promo Partner'"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              format="webp"
            />
          </NuxtLink>
          <div
            v-else
            class="rounded-[calc(theme(borderRadius.3xl)-4px)] overflow-hidden"
          >
            <NuxtImg
              v-if="bannerImage"
              :src="bannerImage"
              :alt="banner?.name ?? 'Promo Partner'"
              class="h-full w-full object-cover"
              loading="lazy"
              format="webp"
            />
          </div>
        </div>

        <div
          v-else
          class="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur"
        >
          <div class="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-secondary/35 blur-3xl" />
          <div class="relative space-y-4">
            <h3 class="text-2xl font-semibold tracking-tight text-secondary">
              Marathon Indonesia
            </h3>
            <p class="text-sm text-white/70 lg:text-base leading-relaxed">
              Apakah anda pengelola event lari dan ingin berkembang bersama kami? beberapa alasan
              mengapa anda harus bekerja sama dengan kami:
            </p>
            <ul class="space-y-3 text-sm text-white/80 lg:text-base">
              <li class="flex items-center gap-3">
                <span
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary"
                >
                  <IconHeroiconsMegaphone20Solid class="h-5 w-5" />
                </span>
                <span class="leading-relaxed">SEO terbaik untuk event lari Indonesia.</span>
              </li>
              <li class="flex items-center gap-3">
                <span
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary"
                >
                  <IconHeroiconsUserGroup20Solid class="h-5 w-5" />
                </span>
                <span class="leading-relaxed">Sosial media dan komunitas lari Indonesia.</span>
              </li>
              <li class="flex items-center gap-3">
                <span
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary"
                >
                  <IconHeroiconsBolt20Solid class="h-5 w-5" />
                </span>
                <span class="leading-relaxed">Dapatkan instant audience.</span>
              </li>
              <li class="flex items-center gap-3">
                <span
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary"
                >
                  <IconHeroiconsChartBar20Solid class="h-5 w-5" />
                </span>
                <span class="leading-relaxed">Tracking performa campaign transparan.</span>
              </li>
              <li class="flex items-center gap-3">
                <span
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary"
                >
                  <IconHeroiconsArrowRight20Solid class="h-5 w-5" />
                </span>
                <span class="leading-relaxed">Dapatkan peluang terbesar untuk bertumbuh.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
