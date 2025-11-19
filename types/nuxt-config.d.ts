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
// Updated: Support untuk manual sitemap chunking dengan sources terpisah

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
      // Global sources (deprecated in favor of per-sitemap sources)
      sources?: string[]
      
      // Manual sitemap chunking - Record of sitemap names to their config
      // Example: { pages: { sources: [...] }, events: { sources: [...] } }
      sitemaps?: boolean | { splitSize?: number } | Record<string, {
        // Sources untuk sitemap ini (preferred method)
        sources?: string[]
        
        // Static URLs atau function untuk generate URLs
        urls?: string[] | (() => string[] | Promise<string[]>)
        
        // Include/exclude patterns
        include?: (string | RegExp)[]
        exclude?: (string | RegExp)[]
        
        // Default metadata untuk URLs di sitemap ini
        defaults?: {
          changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
          priority?: number
          lastmod?: string
        }
        
        // Chunking options untuk sitemap besar
        chunks?: boolean | number
        chunkSize?: number
        
        // Source options
        includeAppSources?: boolean
        includeGlobalSources?: boolean
        
        // Custom sitemap name (override default)
        sitemapName?: string
      }>
      
      // Path prefix untuk sitemap files (default: '/__sitemap__/')
      // Set to '/' for clean URLs like /pages-sitemap.xml
      sitemapsPathPrefix?: string | false
      
      // Compression options
      gzip?: boolean
      
      // XSL stylesheet
      xsl?: boolean | string
      
      // Auto-discovery options
      discoverImages?: boolean
      discoverVideos?: boolean
      
      // Show credits in sitemap
      credits?: boolean
      
      // Strict mode untuk Nuxt Content paths
      strictNuxtContentPaths?: boolean
      
      // Exclude app sources
      excludeAppSources?: boolean | string[]
      
      // Global exclude/include patterns
      exclude?: (string | RegExp)[]
      include?: (string | RegExp)[]
      
      // Auto-add lastmod timestamps
      autoLastmod?: boolean
      
      // Default chunk size for large sitemaps
      defaultSitemapsChunkSize?: number | false
      
      // Legacy: Direct URLs function (deprecated)
      urls?: () => Promise<Array<{
        loc: string
        changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
        priority?: number
        lastmod?: string
        _sitemap?: string // Custom field untuk filtering (not standard)
      }>>
      
      // Legacy: Global defaults (deprecated)
      defaults?: {
        changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
        priority?: number
        lastmod?: string
      }
    }
    seo?: {
      breadcrumbs?: boolean
      linkChecker?: {
        enabled?: boolean
        failOnError?: boolean
      }
    }
    robots?: {
      disallow?: string[]
    }
    ogImage?: {
      enabled?: boolean
      defaults?: {
        url?: string
        width?: number
        height?: number
        alt?: string
      }
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
