<script setup lang="ts">
/* eslint-disable vue/no-v-html */
import { computed } from 'vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import LayoutPageHeader from '~/components/layout/PageHeader.vue'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useStaticPage } from '~/composables/useStaticPage'
import { useSchemaOrg, defineWebPage } from '#imports'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'

const siteSettings = useSiteSettings()
const siteName = computed(
  () => siteSettings.getSetting<string>('site_name', 'indonesiamarathon.com') ?? 'indonesiamarathon.com'
)

const headerBg = computed(
  () =>
    siteSettings.getImage(
      'header_bg_contact',
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
} = await useStaticPage('kontak', {
  defaultTitle: 'Kontak',
  defaultDescription: 'Hubungi tim kami untuk kolaborasi brand, dukungan komunitas, atau koreksi data event.',
})

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [{ text: pageTitle.value, link: null }])

useSeoMetaDynamic({
  title: seoTitle,
  description: seoDescription,
  url: '/kontak',
})

// SEO: OG Image menggunakan fallback og.webp (static page)

// SEO: Schema.org untuk halaman kontak
useSchemaOrg([
  defineWebPage({
    name: pageTitle.value,
    description: seoDescription.value,
  }),
  // ContactPage schema
  {
    '@type': 'ContactPage',
    name: pageTitle.value,
    description: seoDescription.value,
  },
])
</script>

<template>
  <div class="bg-surface min-h-screen">
    <LayoutPageHeader
      :title="pageTitle"
      :description="`Hubungi tim ${siteName} untuk kolaborasi dan dukungan komunitas.`"
      :breadcrumbs="breadcrumbItems"
      :background-image-url="headerBg"
    />

    <section class="py-10">
      <div class="layout-container">
        <div class="rounded-3xl border border-secondary/20 bg-white p-6 lg:p-10 space-y-8">
          <div class="space-y-3">
            <span class="badge-modern inline-flex items-center gap-2">
              <IconHeroiconsSparkles20Solid class="h-4 w-4" />
              Kontak
            </span>
            <p class="text-sm uppercase tracking-[0.35em] text-gray-500">
              Kolaborasi & Dukungan
            </p>
            <h2 class="text-2xl lg:text-4xl font-bold text-primary tracking-tighter leading-[1.15]">
              Terhubung dengan tim indonesiamarathon.com.
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
            Konten kontak belum tersedia. Silakan coba beberapa saat lagi.
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

