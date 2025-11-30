<template>
  <NuxtRouteAnnouncer />
  <!-- Google Tag Manager (noscript) -->
  <noscript v-if="gtmId">
    <iframe
    :src="`https://www.googletagmanager.com/ns.html?id=${gtmId}`"
    height="0"
    width="0"
    style="display:none;visibility:hidden"
    />
  </noscript>
  <!-- End Google Tag Manager (noscript) -->
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
import { computed } from 'vue'
import { useSchemaOrg, defineOrganization, defineWebSite, defineWebPage } from '#imports'
import { useSplideAriaCleanup } from '~/composables/useSplideAriaCleanup'
import { useSiteSettings } from '~/composables/useSiteSettings'

const config = useRuntimeConfig()
const { getSetting } = useSiteSettings()

const apiBaseUrl = config.public.apiBase || 'http://localhost:8000'
const gtmId = computed(() => config.public.googleTagManagerId || undefined)
const currentYear = new Date().getFullYear()

// Fallback values if backend settings are not yet loaded
const siteName = computed(() => getSetting('site_name', 'indonesiamarathon.com'))
const siteDescription = computed(() => getSetting('site_description', 'Platform digital #1 di Indonesia sebagai pusat informasi dan komunitas event lari.'))
const siteUrl = config.public.siteUrl

// Construct social profiles array dynamically
// FIX: Smart URL cleaning to prevent double "https://" prefix
const sameAs = computed(() => {
  const profiles: string[] = []
  
  // Helper function to clean and format social media URLs
  const cleanUrl = (val: string | null, prefix: string): string | null => {
    if (!val) return null
    // If user input is already a full URL, use it as-is
    if (val.startsWith('http://') || val.startsWith('https://')) return val
    // If user input is username (e.g., @indomarathon or indomarathon), add prefix
    return `${prefix}/${val.replace('@', '')}`
  }
  
  const instagram = getSetting('instagram_handle')
  const facebook = getSetting('facebook_url')
  const twitter = getSetting('twitter_handle')
  const tiktok = getSetting('tiktok_handle')

  const igUrl = cleanUrl(instagram, 'https://www.instagram.com')
  const fbUrl = cleanUrl(facebook, 'https://www.facebook.com')
  const twUrl = cleanUrl(twitter, 'https://twitter.com')
  const ttUrl = cleanUrl(tiktok, 'https://www.tiktok.com')

  if (igUrl) profiles.push(igUrl)
  if (fbUrl) profiles.push(fbUrl)
  if (twUrl) profiles.push(twUrl)
  if (ttUrl) profiles.push(ttUrl)
  
  // Fallback: If no social profiles loaded from backend, use hardcoded defaults
  // This ensures sameAs is never empty in production
  if (profiles.length === 0) {
    profiles.push('https://www.instagram.com/indonesia.marathon')
    profiles.push('https://www.facebook.com/indonesia.marathon')
    profiles.push('https://twitter.com/indonesia.marathon')
  }
  
  return profiles
})

// FIX: Complete Schema.org setup with Organization, WebSite, and WebPage
// This ensures proper linking between entities and prevents duplication
useSchemaOrg([
  // 1. ORGANIZATION (Master Node)
  defineOrganization({
    '@id': '#organization', // Use default Nuxt ID for merging
    name: siteName, // Computed - will be reactive
    description: siteDescription, // Computed - will be reactive
    logo: `${siteUrl}/logo.png`,
    url: siteUrl,
    sameAs: sameAs.value, // Unwrap computed for defineOrganization
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/event?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
  }),
  
  // 2. WEBSITE (FIX: Connect to Organization via publisher)
  defineWebSite({
    '@id': '#website',
    name: siteName, // FIX: Use siteName instead of default "frontend"
    url: siteUrl,
    inLanguage: 'id',
    description: siteDescription,
    publisher: {
      '@id': '#organization', // CRITICAL: Link back to organization
    },
  }),
  
  // 3. WEBPAGE (FIX: Connect to Organization via about)
  defineWebPage({
    '@id': '#webpage',
    about: {
      '@id': '#organization', // Link to organization for context
    },
  }),
])

useSplideAriaCleanup()

useHead({
  // 1. TEMPLATE JUDUL (SANGAT PENTING UNTUK SEO)
  // This pattern is excellent and works perfectly with @nuxtjs/seo
  titleTemplate: titleChunk => {
    return titleChunk
      ? `${titleChunk} | ${siteName.value}`
      : `${siteName.value} - Kalender Lari & Jadwal Marathon ${currentYear}`
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
    { name: 'description', content: siteDescription },

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
    { name: 'author', content: siteName },
    {
      name: 'copyright',
      content: computed(() => `© ${currentYear} ${siteName.value}. All rights reserved.`),
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
