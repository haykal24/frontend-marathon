import type { NitroConfig } from 'nitropack'

declare module 'nuxt/schema' {
  interface NuxtConfig {
    devtools?: {
      enabled?: boolean
    }
    nitro?: NitroConfig & {
      compatibilityDate?: string
    }
  }

  interface NuxtOptions {
    devtools?: {
      enabled?: boolean
    }
    nitro?: NitroConfig & {
      compatibilityDate?: string
    }
  }
}

export {}
// Type declarations untuk Nuxt module configurations
// File ini akan di-include oleh TypeScript setelah nuxt prepare

declare module 'nuxt/schema' {
  interface NuxtConfig {
    // @nuxtjs/seo module
    site?: {
      url?: string
      name?: string
      description?: string
      defaultLocale?: string
    }
    sitemap?: {
      sources?: string[]
      xsl?: boolean
    }
    robots?: {
      disallow?: string[]
    }
    // @nuxt/image module
    image?: {
      provider?: string
      quality?: number
      format?: string[]
      domains?: string[]
    }
    // @nuxtjs/partytown module
    partytown?: {
      forward?: string[]
      lib?: string
    }
    // @nuxtjs/tailwindcss module
    tailwindcss?: {
      cssPath?: string
      exposeConfig?: boolean
    }
  }
}
