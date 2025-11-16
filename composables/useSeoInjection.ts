/**
 * Composable untuk inject SEO keyword research langsung di sections
 * Mengimplementasikan best practice: H2/H3 dengan primary keyword, internal linking, etc
 */
import { SEO_KEYWORDS, type KeywordCluster } from '~/utils/seoKeywords'

export interface SeoSectionConfig {
  keyword: KeywordCluster
  sectionType: 'hero' | 'featured' | 'listing' | 'related' | 'faq' | 'cta'
  includeH2: boolean
  includeFAQ: boolean
  includeInternalLinks: boolean
  maxItems?: number
}

export const useSeoInjection = () => {
  /**
   * Generate H2 dengan keyword targeting
   * Pattern: "[Primary Keyword] 2025 - [Action] di Indonesia"
   */
  const generateH2WithKeyword = (keyword: KeywordCluster, action: string = 'Temukan'): string => {
    return `${action} ${keyword.primary} 2025 di Indonesia`
  }

  /**
   * Generate H3 dengan secondary keyword
   * Pattern: "[Secondary Keyword] - [Benefit]"
   */
  const generateH3WithKeyword = (keyword: KeywordCluster, index: number = 0): string => {
    const secondary = keyword.secondaries[index] || keyword.primary
    return `${secondary.charAt(0).toUpperCase()}${secondary.slice(1)}`
  }

  /**
   * Generate meta description dengan keyword
   * Pattern: "[Primary Keyword] [Secondary Keyword] - [Description]"
   */
  const generateMetaDescription = (keyword: KeywordCluster): string => {
    return keyword.description
  }

  /**
   * Get FAQ items dengan keyword
   * Untuk FAQSchema dan Accordion sections
   */
  const generateFAQItems = (keyword: KeywordCluster) => {
    return keyword.relatedQuestions.map(question => {
      const normalizedQuestion = question.replace(/\?$/, '')
      return {
        question,
        answer: `Kami membahas ${normalizedQuestion.toLowerCase()} secara lengkap pada panduan ${keyword.primary}. Mulai dari dasar hingga tips praktis, ${keyword.description}`,
        url: keyword.targetPage,
      }
    })
  }

  /**
   * Generate breadcrumb dengan keyword (untuk internal linking)
   */
  const generateBreadcrumbWithKeyword = (keyword: KeywordCluster, parentName: string = 'Home') => {
    return [
      { text: parentName, link: '/' },
      { text: keyword.primary, link: keyword.targetPage },
    ]
  }

  /**
   * Generate internal linking suggestions untuk section
   */
  const generateInternalLinks = (keyword: KeywordCluster, limit: number = 3) => {
    const links = (keyword.secondaries ?? []).slice(0, limit).map(secondary => ({
      text: secondary,
      url: keyword.targetPage || '/',
      anchor: `Lihat lebih lanjut: ${secondary}`,
    }))
    return links
  }

  /**
   * Generate rich snippet (FAQ Schema)
   */
  const generateFAQSchema = (keyword: KeywordCluster) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: keyword.relatedQuestions.map(question => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Pelajari lengkap tentang "${question}" di panduan ${keyword.primary} kami.`,
        },
      })),
    }
  }

  /**
   * Generate BreadcrumbList Schema dengan keyword
   */
  const generateBreadcrumbSchema = (keyword: KeywordCluster, baseUrl: string) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: keyword.primary,
          item: `${baseUrl}${keyword.targetPage}`,
        },
      ],
    }
  }

  /**
   * Generate section subtitle dengan keyword variation
   * Untuk Hero, Featured, CTA sections
   */
  const generateSectionSubtitle = (keyword: KeywordCluster, type: string = 'feature'): string => {
    const defaultSubtitle = `Jelajahi semua tentang ${keyword.primary}: definisi, tips, dan cara menjalankannya dengan optimal.`
    const subtitles: Record<string, string> = {
      feature: defaultSubtitle,
      cta: `Mulai ${keyword.primary} journey Anda hari ini bersama komunitas pelari Indonesia.`,
      related: `Pelajari lebih lanjut tentang ${keyword.primary} dan topik lari lainnya.`,
      listing: `Daftar lengkap ${keyword.primary} dan event terkait di seluruh Indonesia.`,
    }
    return subtitles[type] && subtitles[type] !== undefined ? subtitles[type] : defaultSubtitle
  }

  /**
   * Generate card title dengan keyword untuk listing
   */
  const generateCardTitle = (keyword: KeywordCluster, index: number = 0): string => {
    const variations = [
      `Panduan Lengkap ${keyword.primary}`,
      `Memahami ${keyword.primary}`,
      `Tips & Trik ${keyword.primary}`,
      `Persiapan ${keyword.primary}`,
      `Strategi ${keyword.primary}`,
    ]
    return variations[index % variations.length] || `Panduan ${keyword.primary}`
  }

  /**
   * Generate meta tags object untuk section
   */
  const generateMetaTags = (keyword: KeywordCluster) => {
    return {
      title: `${keyword.primary} 2025 - ${keyword.targetPage}`,
      description: keyword.description,
      keywords: [keyword.primary, ...keyword.secondaries].join(', '),
      ogTitle: `Panduan ${keyword.primary} 2025 Indonesia`,
      ogDescription: keyword.description,
      canonicalUrl: keyword.targetPage,
    }
  }

  /**
   * Get keyword suggestions untuk section berdasarkan type
   */
  const getKeywordsByType = (
    type: 'informational' | 'navigational' | 'local' | 'ecosystem'
  ): KeywordCluster[] => {
    const categoryMap: Record<string, KeywordCluster[]> = {
      informational: [
        SEO_KEYWORDS.marathon ?? {},
        SEO_KEYWORDS.halfMarathon ?? {},
        SEO_KEYWORDS.pace ?? {},
        SEO_KEYWORDS.cutOff ?? {},
        SEO_KEYWORDS.funRun ?? {},
        SEO_KEYWORDS.trailRun ?? {},
      ].filter((k): k is KeywordCluster => !!k && 'primary' in k),
      navigational: [
        SEO_KEYWORDS.marathonIndonesia ?? {},
        SEO_KEYWORDS.eventLariIndonesia ?? {},
        SEO_KEYWORDS.borobudurMarathon ?? {},
        SEO_KEYWORDS.jakartaMarathon ?? {},
      ].filter((k): k is KeywordCluster => !!k && 'primary' in k),
      local: [
        SEO_KEYWORDS.eventLariBandung ?? {},
        SEO_KEYWORDS.eventLariSurabaya ?? {},
        SEO_KEYWORDS.eventLariYogyakarta ?? {},
      ].filter((k): k is KeywordCluster => !!k && 'primary' in k),
      ecosystem: [
        SEO_KEYWORDS.vendorMedaliLari ?? {},
        SEO_KEYWORDS.raceManagementIndonesia ?? {},
        SEO_KEYWORDS.komunitasLariIndonesia ?? {},
      ].filter((k): k is KeywordCluster => !!k && 'primary' in k),
    }
    return (categoryMap[type] as KeywordCluster[]) || []
  }

  return {
    generateH2WithKeyword,
    generateH3WithKeyword,
    generateMetaDescription,
    generateFAQItems,
    generateBreadcrumbWithKeyword,
    generateInternalLinks,
    generateFAQSchema,
    generateBreadcrumbSchema,
    generateSectionSubtitle,
    generateCardTitle,
    generateMetaTags,
    getKeywordsByType,
    SEO_KEYWORDS,
  }
}
