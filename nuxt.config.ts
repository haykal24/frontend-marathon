// https://nuxt.com/docs/api/configuration/nuxt-config

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-19',
  devtools: { enabled: false },

  experimental: {
    asyncEntry: true,
    payloadExtraction: true,
    crossOriginPrefetch: true,
    viewTransition: true,
    componentIslands: true,
    headNext: true,
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
    '/**': {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
    '/': { swr: 3600 },
    '/event': { swr: 1800 },
    '/event/**': { swr: 600 },
    '/blog': { swr: 3600 },
    '/blog/**': { swr: 86400 },
    '/ekosistem/**': { swr: 7200 },
    '/tentang-kami': { swr: 86400 },
    '/kontak': { swr: 86400 },
    '/rate-card': { swr: 3600 },
    '/admin/**': { ssr: false },
    '/api/**': { ssr: false, cors: true },
  },

  // Site Meta Configuration (Centralized for @nuxtjs/seo)
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://indonesiamarathon.com' : 'http://localhost:3000'),
    name: 'indonesiamarathon.com',
    description: `Platform digital #1 di Indonesia sebagai pusat informasi dan komunitas event lari. Temukan jadwal lari ${new Date().getFullYear()} terlengkap, ekosistem vendor, dan artikel seputar dunia lari.`,
    defaultLocale: 'id-ID',
  },

  // Modules
  modules: [
    '@nuxtjs/seo', // SEO optimization (meta tags, sitemap, robots, schema-org)
    '@nuxt/image', // Image optimization dengan WebP support
    '@nuxtjs/fontaine', // Font metric optimization
    '@nuxt/fonts', // Self-host Saira & Fira Sans
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
            prefix: 'Icon',
            enabledCollections: ['mdi', 'heroicons', 'logos'],
          }),
        ],
        dts: true,
      }),
      Icons({
        autoInstall: true,
        compiler: 'vue3',
        defaultClass: 'inline-block',
        scale: 1.2,
      }),
    ],
  },

  // Runtime Config (API Base URL dari environment variables)
  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE || 'http://localhost:8000/api/v1',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Marathon Indonesia',
    },
  },

  // Sitemap Configuration (@nuxtjs/seo with dynamic backend API)
  sitemap: {
    // Manual chunking dengan sources terpisah per kategori
    // Backend mengirim field `_sitemap` dan frontend filter berdasarkan itu
    // Result: /pages-sitemap.xml, /events-sitemap.xml, /blog-sitemap.xml, /categories-sitemap.xml
    
    // Define manual sitemaps dengan sources terpisah
    sitemaps: {
      pages: {
        sources: ['/api/__sitemap__/pages-urls'],
      },
      events: {
        sources: ['/api/__sitemap__/events-urls'],
      },
      blog: {
        sources: ['/api/__sitemap__/blog-urls'],
      },
      categories: {
        sources: ['/api/__sitemap__/categories-urls'],
      },
    },
    
    // General options
    gzip: true,
    xsl: false,
    discoverImages: true,
    credits: false,
    strictNuxtContentPaths: false,
    
    // Don't auto-add lastmod (sudah di-handle backend)
    autoLastmod: false,
    
    // Exclude paths secara global
    exclude: [
      '/api/**',
      '/_nuxt/**',
      '/admin/**',
      '/login',
      '/register',
      '/mitra/**',
      '/auth/**',
    ],
  },

  seo: {
    // Enable breadcrumbs support
    breadcrumbs: true,
    // Enable Link Checker
    linkChecker: {
      enabled: process.env.NODE_ENV !== 'production',
      failOnError: false, // Don't fail build on broken links, just warn
    },
  },

  // OG Image Configuration
  // Menggunakan og.webp sebagai fallback default untuk semua halaman
  ogImage: {
    enabled: true,
    defaults: {
      url: '/og.webp', // Fallback image di public folder
      width: 1200,
      height: 630,
      alt: 'indonesiamarathon.com - Platform Digital #1 Event Lari Indonesia',
    },
  },

  // Robots Configuration (untuk menghilangkan warning)
  robots: {
    // Disallow internal API routes (normal untuk SEO)
    // Warning ini OK karena /api/** memang tidak perlu di-index
    disallow: ['/api/', '/admin/', '/_nuxt/'],
  },

  image: {
    provider: 'ipx',
    quality: 80,
    format: ['webp', 'avif'],
    domains: [
      'localhost',
      'dasbor.indonesiamarathon.com',
      'indonesiamarathon.com',
    ],
    densities: [1, 2],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  // Font Optimization (Saira & Fira Sans)
  // @nuxtjs/fontaine akan auto-detect fonts dari CSS yang digunakan

  // Partytown Configuration (untuk third-party scripts)
  partytown: {
    forward: ['dataLayer.push', 'fbq'],
  },

  // TailwindCSS Configuration
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    exposeConfig: false,
  },

  // Fontaine Configuration (Font Optimization)
  fontMetrics: {
    fonts: [
      {
        family: 'Saira',
        fallbacks: ['system-ui', 'sans-serif'],
        fallbackName: 'fallback-saira',
      },
      {
        family: 'Fira Sans',
        fallbacks: ['system-ui', 'sans-serif'],
        fallbackName: 'fallback-fira',
      },
    ],
  },

  // Nuxt Fonts: Self-host Google Fonts untuk skor LCP lebih baik
  fonts: {
    defaults: {
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['system-ui', 'sans-serif'],
    },
    families: [
      {
        name: 'Saira',
        weights: ['400', '500', '600', '700', '800'],
      },
      {
        name: 'Fira Sans',
        weights: ['300', '400', '500', '600', '700'],
      },
    ],
  },

  // App Configuration
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in', appear: true },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // SSR Configuration
  ssr: true,

  // Nitro Configuration
  nitro: {
    compressPublicAssets: true,
    experimental: {
      wasm: true,
    },
    timing: false,
    prerender: {
      // Don't fail build on prerender errors (allow build to continue)
      failOnError: false,
      // Disable crawl links - kita pakai SWR untuk semua halaman dinamis
      crawlLinks: false,
      // Only prerender 404 page (500 is runtime error, can't be prerendered)
      routes: ['/404.html'],
    },
  },

  // TypeScript Configuration
  typescript: {
    strict: true,
    typeCheck: false, // Diaktifkan untuk pemeriksaan tipe saat development
  },
})
