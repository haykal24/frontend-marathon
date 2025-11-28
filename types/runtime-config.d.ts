import type { Pinia } from 'pinia'

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    apiBase: string
    siteUrl: string
    appName: string
    public: PublicRuntimeConfig
  }

  interface PublicRuntimeConfig {
    apiBase: string
    siteUrl: string
    appName: string
    r2Domain?: string
    googleAnalyticsId?: string
  }
}

declare module '#app' {
  interface NuxtApp {
    $pinia: Pinia
  }
}

export {}
