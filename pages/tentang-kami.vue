<script setup lang="ts">
import { computed } from 'vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import LayoutPageHeader from '~/components/layout/PageHeader.vue'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useStaticPage } from '~/composables/useStaticPage'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'

const siteSettings = useSiteSettings()
const siteName = computed(
  () => siteSettings.getSetting<string>('site_name', 'indonesiamarathon.com') ?? 'indonesiamarathon.com'
)

const headerBg = computed(
  () =>
    siteSettings.getImage(
      'header_bg_about',
      siteSettings.getImage('header_bg_static', siteSettings.getImage('header_bg_events', null))
    ) ?? undefined
)

const {
  title: pageTitle,
  seoTitle,
  seoDescription,
  renderedContent,
  pending,
  error,
} = await useStaticPage('tentang-kami', {
  defaultTitle: 'Tentang Kami',
  defaultDescription: 'Kenali ekosistem digital di balik platform kalender lari #1 di Indonesia.',
})

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [{ text: pageTitle.value, link: null }])

useSeoMetaDynamic({
  title: seoTitle,
  description: seoDescription,
  url: '/tentang-kami',
})
</script>

<template>
  <div class="bg-surface min-h-screen">
    <LayoutPageHeader
      :title="pageTitle"
      :description="`Kenali ekosistem di balik ${siteName}.`"
      :breadcrumbs="breadcrumbItems"
      :background-image-url="headerBg"
    />

    <section class="py-10">
      <div class="layout-container">
        <div class="rounded-3xl border border-secondary/20 bg-white p-6 lg:p-10 space-y-8">
          <div class="space-y-3">
            <span class="badge-modern inline-flex items-center gap-2">
              <IconHeroiconsSparkles20Solid class="h-4 w-4" />
              Tentang Kami
            </span>
            <p class="text-sm uppercase tracking-[0.35em] text-gray-500">
              Ekosistem pelari Indonesia
            </p>
            <h2 class="text-2xl lg:text-4xl font-bold text-primary tracking-tighter leading-[1.15]">
              Kenali tim & misi kami.
            </h2>
          </div>
          <template v-if="pending">
            <div class="space-y-3">
              <div class="h-5 w-48 rounded-full bg-secondary/10 animate-pulse" />
              <div class="space-y-2">
                <div class="h-4 w-full rounded-full bg-secondary/10 animate-pulse" />
                <div class="h-4 w-5/6 rounded-full bg-secondary/10 animate-pulse" />
                <div class="h-4 w-2/3 rounded-full bg-secondary/10 animate-pulse" />
              </div>
            </div>
          </template>
          <div
            v-else-if="error"
            class="text-center text-gray-500"
          >
            Konten tentang kami belum tersedia. Silakan coba beberapa saat lagi.
          </div>
          <div
            v-else
            class="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            v-html="renderedContent ?? ''"
          />
        </div>
      </div>
    </section>
  </div>
</template>
