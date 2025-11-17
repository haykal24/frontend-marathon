/**
 * SEO Injection Composable - People-First Enhancement
 * Menghasilkan konten SEO yang context-aware dan tidak generic
 * 
 * Best Practices:
 * - FAQ disesuaikan dengan page type (event, blog, listing, detail)
 * - Answers punya multiple templates untuk variasi
 * - Descriptions variatif, bukan repetitif di semua halaman
 * - Limit checks untuk prevent over-optimization
 */

import type { KeywordCluster } from '~/utils/seoKeywords'

export interface SeoContext {
  pageType?: 'event' | 'blog' | 'listing' | 'detail'
  eventData?: {
    title?: string
    cutOffTime?: string
    categories?: string[]
    location?: string
  }
  city?: string
  month?: string
}

/**
 * Main composable untuk SEO injection
 */
export const useSeoInjection = () => {
  const pickRandomValue = <T>(values: T[], fallback: T): T => {
    if (!values.length) {
      return fallback
    }
    const choice = values[Math.floor(Math.random() * values.length)]
    return choice ?? fallback
  }

  /**
   * Generate H2 heading dengan keyword yang natural
   * @example generateH2WithKeyword(SEO_KEYWORDS.marathon, 'Jelajahi')
   * Output: "Jelajahi Marathon: Panduan Lengkap untuk Semua Level Pelari"
   */
  const generateH2WithKeyword = (
    keyword: KeywordCluster,
    action: string = 'Temukan'
  ): string => {
    const variations = [
      `${action} ${keyword.primary}: Panduan Lengkap untuk Semua Level Pelari`,
      `${keyword.primary} 2025: Definisi, Tips & Strategi Sukses`,
      `${action} ${keyword.primary} yang Tepat untuk Tujuanmu`,
      `Panduan Komprehensif ${keyword.primary}: Dari Pemula hingga Atlet`,
    ]

    // Return random variation untuk variasi di halaman yang berbeda
    return pickRandomValue(variations, variations[0] || '')
  }

  /**
   * Generate section subtitle dengan keyword
   * Lebih natural dibanding hardcoded pattern
   */
  const generateSectionSubtitle = (
    keyword: KeywordCluster,
    style: 'feature' | 'short' | 'detailed' = 'feature'
  ): string => {
    const subtitles: Record<string, string[]> = {
      feature: [
        `Jelajahi semua tentang ${keyword.primary}: definisi, tips, dan cara memaksimalkannya. Panduan lengkap dari expert komunitas pelari Indonesia.`,
        `Pelajari ${keyword.primary} secara mendalam dengan panduan interaktif, tips praktis, dan pengalaman dari komunitas lari terbesar di Indonesia.`,
      ],
      short: [
        `Semua yang perlu kamu tahu tentang ${keyword.primary}. Cepat, praktis, dan dari sumber terpercaya.`,
        `Panduan ringkas tentang ${keyword.primary}. Dari definisi, tips, hingga cara menjalankannya dengan sukses.`,
      ],
      detailed: [
        `${keyword.primary} adalah topik penting untuk setiap pelari. Kami menyediakan panduan lengkap, FAQ interaktif, dan insights dari komunitas pelari Indonesia yang aktif dan berpengalaman.`,
        `Ingin memahami ${keyword.primary} dengan lebih baik? Baca panduan komprehensif kami yang mencakup teori, tips praktis, common mistakes, dan success stories.`,
      ],
    }

    const options = subtitles[style] || subtitles.feature || []
    return pickRandomValue(options, subtitles.feature?.[0] || '')
  }

  /**
   * Generate FAQ items dengan context awareness
   * Jawaban akan berbeda tergantung page type (event vs blog)
   */
  const generateFAQItems = (
    keyword: KeywordCluster,
    context?: SeoContext
  ): Array<{ question: string; answer: string }> => {
    // Pilih FAQ yang sesuai dengan context
    let selectedQuestions: string[] = keyword.relatedQuestions || []

    if (context?.pageType === 'event' && keyword.contextualFaqs?.event) {
      selectedQuestions = keyword.contextualFaqs.event
    } else if (context?.pageType === 'blog' && keyword.contextualFaqs?.blog) {
      selectedQuestions = keyword.contextualFaqs.blog
    } else if (context?.pageType === 'listing' && keyword.contextualFaqs?.listing) {
      selectedQuestions = keyword.contextualFaqs.listing
    }

    // Generate answers dengan context awareness
    return selectedQuestions.map((question) => ({
      question,
      answer: generateContextualAnswer(keyword, question, context),
    }))
  }

  /**
   * Generate jawaban yang context-aware & variatif
   * Bukan template generic yang sama di semua halaman
   */
  const generateContextualAnswer = (
    keyword: KeywordCluster,
    question: string,
    context?: SeoContext
  ): string => {
    let answer = ''

    // 1. Cek apakah ada custom answer templates
    if (keyword.answerTemplates && keyword.answerTemplates[question]) {
      const templates = keyword.answerTemplates[question]
      const fallback =
        `Jawaban mengenai "${question}" terkait dengan ${keyword.primary}. Untuk informasi lebih lengkap, baca panduan komprehensif kami.`
      answer = pickRandomValue(templates, fallback)
    } else {
      // 2. Fallback ke default answer dari relatedQuestions (default generic)
      answer = `Jawaban mengenai "${question}" terkait dengan ${keyword.primary}. Untuk informasi lebih lengkap, baca panduan komprehensif kami.`
    }

    // 3. Enhance dengan context data jika event
    if (context?.pageType === 'event' && context?.eventData) {
      const eventData = context.eventData
      
      // Customize answers untuk event-specific questions
      if (
        question.includes('cut off') ||
        question.includes('persyaratan') ||
        question.includes('kategori')
      ) {
        // Inject event-specific data
        if (eventData.cutOffTime && question.includes('cut off')) {
          answer = answer.replace(
            '{eventData.cutOffTime}',
            eventData.cutOffTime
          )
        }
        if (eventData.categories && question.includes('kategori')) {
          const categories = eventData.categories.join(', ')
          answer = answer.replace('{eventData.categories}', categories)
        }
      }
    }

    // 4. Enhance dengan context data jika location-based
    if (context?.city && question.toLowerCase().includes('kota')) {
      answer = answer.replace('{city}', context.city)
    }

    return answer
  }

  /**
   * Generate meta description dengan variasi
   * Tidak selalu sama pattern di setiap halaman
   */
  const generateMetaDescription = (
    keyword: KeywordCluster,
    context?: SeoContext
  ): string => {
    let description = keyword.description

    // Gunakan variants kalau tersedia
    if (keyword.description_variants && keyword.description_variants.length > 0) {
      description = pickRandomValue(
        keyword.description_variants,
        keyword.description
      )
    }

    // Enhance dengan context
    if (context?.city) {
      description = description.replace('{city}', context.city)
    }
    if (context?.eventData?.title) {
      description = description.replace('{eventTitle}', context.eventData.title)
    }

    // Ensure under 160 chars
    if (description.length > 160) {
      description = description.substring(0, 157) + '...'
    }

    return description
  }

  /**
   * Generate card descriptions yang variatif
   * Bukan "Eksplor topik X dan hubungannya dengan Y" di semua card
   */
  const generateCardDescription = (
    keyword: KeywordCluster,
    secondaryKeyword: string
  ): string => {
    const patterns = [
      `Pelajari lebih lanjut tentang ${secondaryKeyword} dan pengaruhnya terhadap ${keyword.primary}.`,
      `Temukan panduan praktis: ${secondaryKeyword} untuk meningkatkan performa ${keyword.primary}.`,
      `${secondaryKeyword} adalah kunci dalam ${keyword.primary}. Baca tips dan best practices.`,
      `Ingin mengerti ${secondaryKeyword}? Kami jelaskan hubungannya dengan ${keyword.primary}.`,
      `Panduan lengkap: bagaimana ${secondaryKeyword} membantu kesuksesan ${keyword.primary}.`,
    ]

    return pickRandomValue(patterns, patterns[0] || '')
  }

  /**
   * Generate internal links dengan context awareness
   * Limit ke 3 links max untuk tidak over-optimize
   */
  const generateInternalLinks = (
    keyword: KeywordCluster,
    maxItems: number = 3
  ): Array<{ text: string; url: string }> => {
    const links: Array<{ text: string; url: string }> = []

    // Mapping untuk URL berdasarkan keyword type
    const getUrlForKeyword = (key: string, page: string): string => {
      // Jika sudah full path (dimulai dengan /), gunakan as-is
      if (page.startsWith('/')) {
        return page
      }

      // Mapping untuk keywords umum ke URL internal
      const keywordToUrl: Record<string, string> = {
        'marathon': '/event?type=marathon',
        'half-marathon': '/event?type=half-marathon',
        'fun-run': '/event?type=fun-run',
        'trail-run': '/event?type=trail-run',
        '5k': '/event?type=5k',
        '10k': '/event?type=10k',
        'pace': '/blog/pace-adalah-cara-menghitung',
        'cut-off': '/blog/cut-off-adalah',
        'event-lari-indonesia': '/event',
      }

      return keywordToUrl[key.toLowerCase()] || page
    }

    // Primary keyword (link utama)
    links.push({
      text: keyword.primary,
      url: getUrlForKeyword(keyword.primary, keyword.targetPage),
    })

    // Secondary keywords (limit ke maxItems-1)
    const secondariesToUse = keyword.secondaries.slice(0, maxItems - 1)
    secondariesToUse.forEach((secondary) => {
      links.push({
        text: secondary,
        url: getUrlForKeyword(secondary, keyword.targetPage),
      })
    })

    return links.slice(0, maxItems)
  }

  /**
   * Generate FAQ Schema.org dengan context awareness
   * Ensure schema === visible content (no ghost FAQ)
   */
  const generateFAQSchema = (
    items: Array<{ question: string; answer: string }>
  ): object => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }
  }

  /**
   * Validate page untuk prevent over-optimization
   * Warning jika terlalu banyak SEO blocks
   */
  const validatePageSeoHealth = (
    pageType: string,
    faqBlocksCount: number,
    relatedKeywordBlocksCount: number
  ): {
    isHealthy: boolean
    warnings: string[]
  } => {
    const warnings: string[] = []

    if (faqBlocksCount > 2) {
      warnings.push(
        `⚠️ Terlalu banyak FAQ blocks (${faqBlocksCount}). Idealnya max 1-2 per halaman untuk people-first content.`
      )
    }

    if (relatedKeywordBlocksCount > 1) {
      warnings.push(
        `⚠️ Multiple related keywords blocks. Pertimbangkan untuk merge atau kurangi.`
      )
    }

    if (faqBlocksCount + relatedKeywordBlocksCount > 3) {
      warnings.push(
        `⚠️ Total SEO blocks (${faqBlocksCount + relatedKeywordBlocksCount}) terasa terlalu banyak. Jaga keseimbangan konten utama vs SEO elements.`
      )
    }

    return {
      isHealthy: warnings.length === 0,
      warnings,
    }
  }

  /**
   * Get keywords by type untuk filtering
   */
  const getKeywordsByType = (
    type: 'informational' | 'navigational' | 'local' | 'ecosystem',
    keywords: Record<string, KeywordCluster>
  ): KeywordCluster[] => {
    return Object.values(keywords).filter((k) => k.type === type)
  }

  return {
    generateH2WithKeyword,
    generateSectionSubtitle,
    generateFAQItems,
    generateContextualAnswer,
    generateMetaDescription,
    generateCardDescription,
    generateInternalLinks,
    generateFAQSchema,
    validatePageSeoHealth,
    getKeywordsByType,
  }
}
