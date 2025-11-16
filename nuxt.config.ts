// https://nuxt.com/docs/api/configuration/nuxt-config

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-11-15',
  devtools: { enabled: false },
  // nitro: {
  //   compatibilityDate: '2025-11-14',
  // },

  experimental: {
    asyncEntry: true,
    payloadExtraction: true,
    crossOriginPrefetch: true,
    viewTransition: true,
    componentIslands: true,
    defaults: {
      nuxtLink: {
        prefetchOn: {
          visibility: false,
          interaction: true,
        },
      },
    },
  },

  routeRules: {
    // Homepage: Prerender + SWR (1 jam) - Data relatif stabil
    '/': { prerender: true, swr: 3600 },

    // Event Listing: SWR (30 menit) - Data bisa update tapi tidak terlalu sering
    '/event': { swr: 1800 },

    // Event Detail: SWR (10 menit) - Bisa ada update status, harga, dll
    '/event/**': { swr: 600 },

    // Blog Listing: SWR (1 jam) - Konten blog tidak terlalu sering update
    '/blog': { swr: 3600 },

    // Blog Detail: SWR (1 jam) - Artikel jarang diupdate setelah publish
    '/blog/**': { swr: 3600 },

    // Direktori: SWR (2 jam) - Data vendor/komunitas relatif stabil
    '/ekosistem/**': { swr: 7200 },

    // Static Pages: Prerender - Halaman statis tidak berubah
    '/tentang-kami': { prerender: true },
    '/kontak': { prerender: true },
    '/rate-card': { prerender: true },

    // Admin/API routes: No SSR (client-side only)
    '/admin/**': { ssr: false },
    '/api/**': { ssr: false },
  },

  // Modules
  modules: [
    '@nuxtjs/seo', // SEO optimization (meta tags, sitemap, robots, schema-org)
    '@nuxt/image', // Image optimization dengan WebP support
    '@nuxtjs/fontaine', // Font optimization untuk Saira & Fira Sans
    '@nuxtjs/partytown', // Third-party scripts ke web worker
    '@nuxt/scripts', // Script management
    '@nuxtjs/tailwindcss', // TailwindCSS 4
    '@pinia/nuxt', // Pinia state management
    'nuxt-splide', // Splide slider integration
  ],

  vite: {
    plugins: [
      Components({
        resolvers: [
          IconsResolver({
            prefix: 'Icon', // Menggunakan <Icon...>
          }),
        ],
      }),
      Icons({
        autoInstall: true,
      }),
    ],
  },

  // Runtime Config (API Base URL dari environment variables)
  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE || 'http://localhost:8000/api/v1',
    siteUrl: process.env.NUXT_SITE_URL || 'http://localhost:3000',
    appName: process.env.NUXT_APP_NAME || 'Marathon Indonesia',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Marathon Indonesia',
    },
  },

  // Sitemap Configuration
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    xsl: false,
  },

  // Robots Configuration (untuk menghilangkan warning)
  robots: {
    // Disallow internal API routes (normal untuk SEO)
    // Warning ini OK karena /api/** memang tidak perlu di-index
    disallow: ['/api/', '/admin/', '/_nuxt/'],
  },

  // Image Optimization (@nuxt/image)
  image: {
    provider: 'ipx',
    quality: 80,
    format: ['webp'],
    domains: ['localhost', 'marathonindonesia.com'],
  },

  // Font Optimization (Saira & Fira Sans)
  // @nuxtjs/fontaine akan auto-detect fonts dari CSS yang digunakan

  // Partytown Configuration (untuk third-party scripts)
  partytown: {
    forward: ['dataLayer.push'],
    lib: '/~partytown/',
  },

  // TailwindCSS Configuration
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    exposeConfig: true,
  },

  // App Configuration
  app: {
    head: {
      // Minimal head configuration - most is in app.vue
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Saira:wght@400;500;600;700&family=Fira+Sans:wght@400;500;600&display=swap',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in', appear: true },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // SSR Configuration
  ssr: true,

  // TypeScript Configuration
  typescript: {
    strict: true,
    typeCheck: false, // Diaktifkan untuk pemeriksaan tipe saat development
  },
})
