/**
 * Utility untuk internal linking strategy
 * Sesuai rekomendasi SEO: "Terapkan strategi internal linking yang ketat untuk mengalirkan otoritas"
 *
 * Contoh: Artikel di /blog/ harus menautkan secara kontekstual ke halaman yang relevan di /event/
 */
export interface InternalLink {
  text: string
  href: string
  description?: string
}

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
