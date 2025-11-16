<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const config = useRuntimeConfig()
const route = useRoute()

const apiBaseUrl = config.public.apiBase || 'http://localhost:8000'
const siteUrl = config.public.siteUrl || 'http://localhost:3000'
const siteName = 'indonesiamarathon.com'
const currentYear = new Date().getFullYear()

// Dynamic description dengan tahun otomatis
const defaultDescription = computed(
  () =>
    `Platform digital #1 di Indonesia sebagai pusat informasi dan komunitas event lari. Temukan jadwal lari ${currentYear} terlengkap, ekosistem vendor, dan artikel seputar dunia lari.`
)

const defaultOgImage = `${siteUrl}/og.webp`

// Build canonical URL
const canonicalUrl = computed(() => {
  const path = route.path === '/' ? '' : route.path
  return `${siteUrl}${path}`
})

// Generate BreadcrumbList schema based on current route
const generateBreadcrumbs = () => {
  const breadcrumbs = [{ position: 1, name: 'Home', item: siteUrl }]

  const pathSegments = route.path.split('/').filter(Boolean)

  if (pathSegments.length > 0) {
    let path = ''
    pathSegments.forEach((segment, _index) => {
      path += `/${segment}`
      const segmentName = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      breadcrumbs.push({
        position: breadcrumbs.length + 1,
        name: segmentName,
        item: `${siteUrl}${path}`,
      })
    })
  }

  return breadcrumbs
}

useHead({
  // 1. TEMPLATE JUDUL (SANGAT PENTING UNTUK SEO)
  titleTemplate: titleChunk => {
    return titleChunk
      ? `${titleChunk} | ${siteName}`
      : `${siteName} - Kalender Lari & Jadwal Marathon ${currentYear} Terlengkap di Indonesia`
  },

  htmlAttrs: {
    lang: 'id',
  },

  meta: [
    // 2. META TEKNIS DASAR
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'referrer', content: 'no-referrer-when-downgrade' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'description', content: defaultDescription.value },

    // 3. PWA & MOBILE
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'IndoMarathon' },

    // 4. WARNA TEMA (Sesuai UI Playbook)
    { name: 'msapplication-TileColor', content: '#121212' },
    { name: 'theme-color', content: '#121212' },
    { name: 'color-scheme', content: 'dark light' },

    // 5. OPEN GRAPH (OG) - Untuk Social Media Sharing
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { property: 'og:title', content: siteName },
    { property: 'og:description', content: defaultDescription.value },
    { property: 'og:image', content: defaultOgImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:type', content: 'image/webp' },
    { property: 'og:locale', content: 'id_ID' },

    // 6. TWITTER CARD
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: siteName },
    { name: 'twitter:description', content: defaultDescription.value },
    { name: 'twitter:image', content: defaultOgImage },
    { name: 'twitter:image:alt', content: siteName },

    // 7. ADDITIONAL SEO
    {
      name: 'keywords',
      content: 'kalender lari, jadwal marathon, event running, fun run, trail run, Indonesia',
    },
    { name: 'author', content: siteName },
    {
      name: 'copyright',
      content: `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`,
    },
  ],

  link: [
    // 8. CANONICAL URL (Dynamic - berdasarkan current route)
    { rel: 'canonical', href: canonicalUrl.value },

    // 9. FAVICONS & MANIFEST (PWA)
    // Semua asset sudah ada di public folder dan disupport dari favicon.io
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' },
    { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' },
    { rel: 'manifest', href: '/site.webmanifest' },

    // 10. PRECONNECT (Kritis untuk Performa)
    { rel: 'preconnect', href: new URL(apiBaseUrl).origin, crossorigin: 'anonymous' },
    { rel: 'dns-prefetch', href: new URL(apiBaseUrl).origin },
  ],

  script: [
    // 11. BREADCRUMBLIST SCHEMA (Global - untuk semua halaman)
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: generateBreadcrumbs().map(item => ({
          '@type': 'ListItem',
          position: item.position,
          name: item.name,
          item: item.item,
        })),
      }),
    },
  ],
})
</script>

<style>
/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s ease-in-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(0.5rem);
}

/* Layout Transitions */
.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s ease-in-out;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>
