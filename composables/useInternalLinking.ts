/**
 * Utility untuk internal linking strategy + Google Sitelinks optimization
 * 
 * Sitelink best practices:
 * 1. Anchor text informatif, relevan, dan ringkas (3-5 kata)
 * 2. Struktur situs logis yang memudahkan navigasi
 * 3. Link ke halaman penting yang relevan
 * 4. Hindari pengulangan konten & anchor text
 * 5. Jelas hierarchy (breadcrumb, navigation)
 *
 * Contoh: Artikel di /blog/ harus menautkan secara kontekstual ke halaman yang relevan di /event/
 */
export interface InternalLink {
  text: string
  href: string
  description?: string
  priority?: 'high' | 'medium' | 'low' // Untuk sitelink priority
  isMainSitelink?: boolean // Jika ini adalah main sitelink candidate
}

/**
 * Main navigation structure untuk sitelinks
 * Google akan prefer links dari homepage dengan clear hierarchy
 */
export const MAIN_SITELINKS: InternalLink[] = [
  {
    text: 'Kalender Lari',
    href: '/event',
    description: 'Jadwal event running dan marathon 2025 di Indonesia',
    priority: 'high',
    isMainSitelink: true,
  },
  {
    text: 'Blog Lari',
    href: '/blog',
    description: 'Panduan marathon, pace, trail run, dan tips lari',
    priority: 'high',
    isMainSitelink: true,
  },
  {
    text: 'Ekosistem',
    href: '/ekosistem',
    description: 'Vendor, komunitas, dan race management di Indonesia',
    priority: 'high',
    isMainSitelink: true,
  },
  {
    text: 'Rate Card',
    href: '/rate-card',
    description: 'Promosikan event lari Anda bersama kami',
    priority: 'medium',
    isMainSitelink: true,
  },
]

/**
 * Generate internal links untuk halaman event berdasarkan kategori/jenis
 * Contoh: Link ke "Half Marathon 2025" dari artikel "Program Latihan Half Marathon Pemula"
 */
export const useEventInternalLinks = (
  category?: string,
  type?: string,
  city?: string
): InternalLink[] => {
  const links: InternalLink[] = []

  if (category) {
    links.push({
      text: `Lihat Jadwal ${category} 2025`,
      href: `/event?type=${category.toLowerCase()}`,
      description: `Temukan semua event ${category} terbaru di Indonesia`,
    })
  }

  if (type) {
    const typeMap: Record<string, string> = {
      'half-marathon': 'Half Marathon',
      marathon: 'Marathon',
      'trail-run': 'Trail Run',
      'fun-run': 'Fun Run',
      'virtual-run': 'Virtual Run',
    }

    links.push({
      text: `Daftar ${typeMap[type] || type} 2025`,
      href: `/event?type=${type}`,
      description: `Jadwal lengkap ${typeMap[type] || type} di Indonesia`,
    })
  }

  if (city) {
    links.push({
      text: `Event Lari di ${city}`,
      href: `/event?province=${city.toLowerCase()}`,
      description: `Temukan event lari terdekat di ${city}`,
    })
  }

  return links
}

/**
 * Generate internal links untuk halaman blog dari halaman event
 * Contoh: Link ke "Program Latihan Half Marathon" dari halaman event Half Marathon
 */
export const useBlogInternalLinks = (topic?: string): InternalLink[] => {
  const links: InternalLink[] = []

  const topicMap: Record<string, { href: string; text: string }> = {
    'half-marathon': {
      href: '/blog/latihan-half-marathon-pemula',
      text: 'Program Latihan Half Marathon Pemula',
    },
    marathon: {
      href: '/blog/panduan-latihan-marathon',
      text: 'Panduan Latihan Marathon untuk Pemula',
    },
    'trail-run': {
      href: '/blog/tips-trail-running',
      text: 'Tips dan Panduan Trail Running',
    },
    nutrisi: {
      href: '/blog/panduan-nutrisi-pelari',
      text: 'Panduan Nutrisi untuk Pelari',
    },
    perlengkapan: {
      href: '/blog/panduan-perlengkapan-lari',
      text: 'Panduan Memilih Perlengkapan Lari',
    },
  }

  if (topic && topicMap[topic]) {
    links.push({
      text: topicMap[topic].text,
      href: topicMap[topic].href,
      description: 'Pelajari tips dan panduan lengkap untuk meningkatkan performa lari Anda',
    })
  }

  return links
}

/**
 * Generate CTA links untuk konversi
 * Contoh: "Siap mendaftar? Lihat Jadwal Half Marathon 2025 di sini"
 */
export const useCtaLinks = (eventType: string, city?: string): InternalLink => {
  const cityText = city ? ` di ${city}` : ''
  const queryParams = new URLSearchParams()
  queryParams.set('type', eventType.toLowerCase())
  if (city) {
    queryParams.set('province', city.toLowerCase())
  }

  return {
    text: `Siap mendaftar? Lihat Jadwal ${eventType}${cityText} 2025 di sini`,
    href: `/event?${queryParams.toString()}`,
    description: 'Temukan dan daftar event lari terbaru sekarang',
  }
}

/**
 * Validate & optimize anchor text untuk sitelinks
 * Sitelink best practice: ringkas (3-5 kata), informatif, tidak repetitif
 */
export const validateAnchorText = (text: string): {
  isValid: boolean
  warnings: string[]
} => {
  const warnings: string[] = []
  const wordCount = text.trim().split(/\s+/).length

  if (wordCount < 2) {
    warnings.push(`⚠️ Anchor text terlalu pendek (${wordCount} kata). Minimal 2 kata untuk clarity.`)
  }

  if (wordCount > 8) {
    warnings.push(`⚠️ Anchor text terlalu panjang (${wordCount} kata). Maksimal 5-8 kata untuk sitelink.`)
  }

  if (text.toLowerCase().includes('klik di sini')) {
    warnings.push(`⚠️ Avoid generic anchor text seperti "klik di sini". Gunakan anchor yang deskriptif.`)
  }

  if (text.toLowerCase().includes('link') || text.toLowerCase().includes('halaman')) {
    warnings.push(`⚠️ Anchor text mengandung kata "link" atau "halaman". Gunakan kata yang lebih spesifik.`)
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}

/**
 * Detect & prevent duplicate anchor text di satu halaman
 * Google tidak menyukai banyak link dengan anchor text yang sama
 */
export const detectDuplicateAnchors = (
  links: InternalLink[]
): {
  hasDuplicates: boolean
  duplicates: Map<string, number>
} => {
  const anchorCounts = new Map<string, number>()

  links.forEach((link) => {
    const anchor = link.text.toLowerCase().trim()
    anchorCounts.set(anchor, (anchorCounts.get(anchor) || 0) + 1)
  })

  const duplicates = new Map(
    Array.from(anchorCounts.entries()).filter(([_, count]) => count > 1)
  )

  // Silent in production - warnings only in development
  if (duplicates.size > 0 && import.meta.dev) {
    Array.from(duplicates.entries()).forEach(([_anchor, _count]) => {
      // Removed console.warn for cleaner logs
    })
  }

  return {
    hasDuplicates: duplicates.size > 0,
    duplicates,
  }
}

/**
 * Get main sitelinks untuk homepage
 * Google prefer struktur navigasi yang jelas dan konsisten
 */
export const useMainSitelinks = (): InternalLink[] => {
  return MAIN_SITELINKS
}

/**
 * Get high-priority internal links untuk SEO value
 */
export const getHighPriorityLinks = (links: InternalLink[]): InternalLink[] => {
  return links.filter((link) => link.priority === 'high')
}
