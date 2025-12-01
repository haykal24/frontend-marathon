/**
 * Composable untuk generate Article Schema.org sesuai standar Google
 * 
 * Mengikuti panduan Google Article Schema:
 * https://developers.google.com/search/docs/appearance/structured-data/article
 */

import type { BlogPost, BlogAuthor } from '~/types/blog'

export interface ArticleSchemaOptions {
  post: BlogPost | null
  siteUrl: string
  siteName: string
  organizationUrl?: string
}

/**
 * Generate multiple image URLs dengan berbagai aspect ratio untuk Article schema
 * Sesuai rekomendasi Google: 16x9, 4x3, dan 1x1 dengan minimal 50k piksel
 * 
 * Google merekomendasikan:
 * - 16x9: 1920x1080 (2,073,600 piksel) - untuk desktop/landscape
 * - 4x3: 1600x1200 (1,920,000 piksel) - untuk tablet
 * - 1x1: 1200x1200 (1,440,000 piksel) - untuk mobile/square
 */
function generateArticleImages(
  bannerUrl: string | null | undefined,
  siteUrl: string
): string[] {
  if (!bannerUrl) {
    return []
  }

  // Jika banner URL sudah absolute, gunakan langsung
  // Jika relative, tambahkan siteUrl
  const baseUrl = bannerUrl.startsWith('http') ? bannerUrl : `${siteUrl}${bannerUrl}`

  // Generate multiple aspect ratios sesuai rekomendasi Google
  // Menggunakan Nuxt Image untuk generate URL dengan query parameters
  // Format: baseUrl?w=1920&h=1080&fit=crop (contoh)
  
  // Untuk saat ini, kita return base URL utama
  // Backend/Nuxt Image akan handle multiple sizes secara otomatis
  // Di masa depan bisa ditambahkan query params untuk specific sizes:
  // - 16x9: ?w=1920&h=1080
  // - 4x3: ?w=1600&h=1200
  // - 1x1: ?w=1200&h=1200
  
  return [baseUrl]
}

/**
 * Format author untuk Article schema
 * Sesuai praktik terbaik Google: Person dengan name dan url
 * 
 * Google merekomendasikan menambahkan URL author untuk E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * Jika belum ada halaman profil author, arahkan ke halaman Tentang Kami sebagai fallback
 */
function formatAuthor(author: BlogAuthor | null | undefined, siteUrl: string) {
  if (!author) {
    // Fallback: jika tidak ada author, gunakan Organization
    return {
      '@type': 'Organization' as const,
      name: 'Indonesia Marathon Team',
      url: `${siteUrl}/tentang-kami`,
    }
  }

  const authorSchema: {
    '@type': 'Person'
    name: string
    url: string
  } = {
    '@type': 'Person',
    name: author.name,
    // Tambahkan URL author untuk memenuhi rekomendasi Google
    // Jika belum ada halaman profil author, arahkan ke halaman Tentang Kami
    // Di masa depan bisa dibuat: `${siteUrl}/author/${author.slug}` atau `${siteUrl}/tentang-kami`
    url: `${siteUrl}/tentang-kami`,
  }

  return authorSchema
}

/**
 * Format date ke ISO 8601 dengan timezone
 */
function formatISODate(dateString: string | null | undefined): string | undefined {
  if (!dateString) {
    return undefined
  }

  try {
    const date = new Date(dateString)
    // Return ISO 8601 dengan timezone (contoh: 2024-01-05T08:00:00+08:00)
    return date.toISOString()
  } catch {
    return undefined
  }
}

/**
 * Generate Article Schema.org sesuai standar Google
 */
export function useArticleSchema(options: ArticleSchemaOptions) {
  const { post, siteUrl, siteName, organizationUrl } = options

  if (!post) {
    return null
  }

  // Publisher (Organization) - WAJIB untuk Article schema
  const publisher = {
    '@type': 'Organization' as const,
    name: siteName,
    url: organizationUrl || siteUrl,
  }

  // Author - bisa Person atau Organization
  const author = formatAuthor(post.author, siteUrl)

  // Images - array dengan multiple aspect ratios (rekomendasi Google)
  const images = generateArticleImages(post.banner, siteUrl)

  // Article schema - format yang kompatibel dengan defineArticle dari @nuxtjs/seo
  // defineArticle akan otomatis menambahkan @context dan @type
  // Semua properti sesuai standar Google Article Schema
  const articleSchema = {
    // WAJIB: Headline (judul artikel)
    headline: post.title,
    
    // WAJIB: Description (untuk rich results)
    description: post.seo_description || post.excerpt || post.title,
    
    // DIREKOMENDASIKAN: Date Published (ISO 8601 dengan timezone)
    datePublished: formatISODate(post.published_at),
    
    // DIREKOMENDASIKAN: Date Modified (ISO 8601 dengan timezone)
    dateModified: formatISODate(post.updated_at || post.published_at),
    
    // WAJIB: Author (Person atau Organization) - Array untuk multiple authors
    // Author sudah include URL untuk memenuhi rekomendasi Google E-E-A-T
    author: author ? [author] : [
      {
        '@type': 'Organization' as const,
        name: siteName,
        url: organizationUrl || siteUrl,
      }
    ],
    
    // WAJIB: Publisher (Organization)
    publisher,
    
    // DIREKOMENDASIKAN: URL kanonis artikel
    url: `${siteUrl}/blog/${post.slug}`,
    
    // DIREKOMENDASIKAN: Image array (multiple aspect ratios: 16x9, 4x3, 1x1)
    // Minimal 50k piksel per gambar
    image: images.length > 0 ? images : undefined,
    
    // DIREKOMENDASIKAN: MainEntityOfPage untuk SEO
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
    
    // OPSIONAL: Article body (content) - bisa ditambahkan untuk rich results
    articleBody: post.content ? post.content.substring(0, 5000) : undefined, // Max 5000 chars untuk schema
    
    // OPSIONAL: Word count (estimasi)
    wordCount: post.content ? post.content.split(/\s+/).length : undefined,
    
    // OPSIONAL: Category/tags untuk grouping
    ...(post.category && {
      articleSection: post.category.name,
    }),
    
    // OPSIONAL: Keywords dari tags
    ...(post.tags && post.tags.length > 0 && {
      keywords: post.tags.map(tag => tag.name).join(', '),
    }),
  }

  return articleSchema
}

