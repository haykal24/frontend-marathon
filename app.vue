<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <!-- 
      OPTIMASI NAVIGASI BACK: 
      KeepAlive menjaga component state saat navigasi, 
      mencegah re-render dan refetch data yang sudah di-cache
    -->
    <NuxtPage :keepalive="{ max: 10 }" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useSchemaOrg, defineOrganization } from '#imports'
import { useSplideAriaCleanup } from '~/composables/useSplideAriaCleanup'

const config = useRuntimeConfig()
const siteConfig = useSiteConfig()

const apiBaseUrl = config.public.apiBase || 'http://localhost:8000'
const currentYear = new Date().getFullYear()

// Define Organization Schema using the composable with full details
useSchemaOrg([
  defineOrganization({
    name: siteConfig.name || 'indonesiamarathon.com',
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [
      'https://www.instagram.com/indonesiamarathon',
      'https://www.tiktok.com/@indonesiamarathon',
    ],
    // Add potentialAction for Google Sitelinks Search Box
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteConfig.url}/event?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
  }),
])

useSplideAriaCleanup()

useHead({
  // 1. TEMPLATE JUDUL (SANGAT PENTING UNTUK SEO)
  // This pattern is excellent and works perfectly with @nuxtjs/seo
  titleTemplate: titleChunk => {
    return titleChunk
      ? `${titleChunk} | ${siteConfig.name}`
      : `${siteConfig.name} - Kalender Lari & Jadwal Marathon ${currentYear}`
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
    
    // Default description is now handled by site config, but can be overridden per page

    // 3. PWA & MOBILE
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'IndoMarathon' },

    // 4. WARNA TEMA (Sesuai UI Playbook)
    { name: 'msapplication-TileColor', content: '#121212' },
    { name: 'theme-color', content: '#121212' },
    { name: 'color-scheme', content: 'dark light' },

    // OG and Twitter defaults are now handled by @nuxtjs/seo via site config

    // 7. ADDITIONAL SEO
    // NOTE: Meta keywords REMOVED - Google deprecated this since 2009
    // Author and copyright can also be managed by the module if needed,
    // but this is fine here for explicit control.
    { name: 'author', content: siteConfig.name },
    {
      name: 'copyright',
      content: `© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.`,
    },
  ],

  link: [
    // Canonical URL is now automatically handled by @nuxtjs/seo

    // 9. FAVICONS & MANIFEST (PWA)
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

  // The Organization and Breadcrumb schemas have been refactored
  // using useSchemaOrg() composable for better integration.
  script: [],
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
