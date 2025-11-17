# SEO Injection Strategy - Implementasi Keyword Research

## Overview

Sistem SEO injection memungkinkan Anda meng-inject keyword research langsung di setiap section, menciptakan internal linking yang kuat dan meningkatkan ranking untuk semua keyword potensial.

**Goal**: Dominasi semua keyword potensial seperti "marathon", "pace", "fun run", "borobudur marathon" dll dengan strategic placement di sections.

---

## Architecture

### 1. **SEO Keywords Database** (`utils/seoKeywords.ts`)

Menyimpan semua keyword research dengan metadata:

```typescript
interface KeywordCluster {
  primary: string // "Marathon"
  secondaries: string[] // ["apa itu marathon", "marathon berapa km", ...]
  relatedQuestions: string[] // ["Apa itu marathon?", ...]
  priority: 'high' | 'medium'
  targetPage: string // "/blog/apa-itu-marathon-jarak-lari"
  description: string // Untuk SEO description
}
```

**Available Keywords**:

- ✅ Informational: `marathon`, `halfMarathon`, `pace`, `cutOff`, `funRun`, `trailRun`
- ✅ Navigational: `marathonIndonesia`, `eventLariIndonesia`, `borobudurMarathon`, `jakartaMarathon`
- ✅ Location: `eventLariBandung`, `eventLariSurabaya`, `eventLariYogyakarta`
- ✅ Ecosystem: `vendorMedaliLari`, `raceManagementIndonesia`, `komunitasLariIndonesia`

### 2. **SEO Injection Composable** (`composables/useSeoInjection.ts`)

Helper functions untuk generate SEO-optimized content:

```typescript
const {
  generateH2WithKeyword, // H2 dengan primary keyword
  generateH3WithKeyword, // H3 dengan secondary keyword
  generateMetaDescription, // Meta description
  generateFAQItems, // FAQ dengan keyword
  generateBreadcrumbWithKeyword,
  generateInternalLinks, // Internal linking suggestions
  generateFAQSchema, // FAQ Schema.org
  generateSectionSubtitle, // Subtitle untuk sections
  getKeywordsByType, // Filter keywords by type
} = useSeoInjection()
```

### 3. **SEO Components** (Reusable)

#### `components/seo/SeoFaqSection.vue`

- FAQ accordion dengan keyword
- Auto-generated dari `keyword.relatedQuestions`
- Inject FAQ Schema untuk rich snippets
- CTA dengan internal link ke target page

```vue
<template>
  <SeoFaqSection
    :keyword="SEO_KEYWORDS.marathon"
    :show-cta="true"
    cta-label="Baca Panduan Lengkap Marathon"
    cta-url="/blog/apa-itu-marathon-jarak-lari"
  />
</template>
```

#### `components/seo/SeoRelatedKeywords.vue`

- Related keywords dengan internal linking
- Card grid dengan secondary keywords
- Tag badges untuk semua related terms

```vue
<template>
  <SeoRelatedKeywords :keyword="SEO_KEYWORDS.pace" />
</template>
```

---

## Implementation Pattern

### Pattern 1: Hero/Featured Sections

Tambah keyword targeted di heading:

```vue
<script setup lang="ts">
import { useSeoInjection } from '~/composables/useSeoInjection'
import { SEO_KEYWORDS } from '~/utils/seoKeywords'

const { generateH2WithKeyword, generateSectionSubtitle } = useSeoInjection()

const h2Title = generateH2WithKeyword(SEO_KEYWORDS.eventLariIndonesia, 'Jelajahi')
// Result: "Jelajahi Event Lari Indonesia 2025 di Indonesia"

const subtitle = generateSectionSubtitle(SEO_KEYWORDS.eventLariIndonesia, 'feature')
// Result: "Jelajahi semua tentang Event Lari Indonesia: definisi, tips, dan cara menjalankannya..."
</script>

<template>
  <section class="bg-surface py-10 lg:py-16">
    <div class="layout-container space-y-8">
      <h2 class="text-4xl font-bold text-primary">{{ h2Title }}</h2>
      <p class="text-gray-600 text-base">{{ subtitle }}</p>
      <!-- Rest of section -->
    </div>
  </section>
</template>
```

### Pattern 2: List/Listing Pages

Inject keyword di page title dan add internal linking:

```vue
<script setup lang="ts">
import { useSeoInjection } from '~/composables/useSeoInjection'
import { SEO_KEYWORDS } from '~/utils/seoKeywords'

const { generateMetaTags, generateH2WithKeyword } = useSeoInjection()

// Update SEO meta
useSeoMetaDynamic({
  title: 'Jadwal Event Marathon 2025 Indonesia',
  description: SEO_KEYWORDS.marathonIndonesia.description,
})

// Use in template
const h2Title = generateH2WithKeyword(SEO_KEYWORDS.marathonIndonesia, 'Temukan')
</script>

<template>
  <div>
    <h2>{{ h2Title }}</h2>
    <p>{{ subtitle }}</p>

    <!-- Add internal links di akhir listing -->
    <SeoRelatedKeywords :keyword="SEO_KEYWORDS.marathonIndonesia" />
  </div>
</template>
```

### Pattern 3: Blog/Detail Pages

Inject FAQ section dan related keywords:

```vue
<script setup lang="ts">
import { SEO_KEYWORDS } from '~/utils/seoKeywords'

const keyword = computed(() => SEO_KEYWORDS.marathon)
</script>

<template>
  <article>
    <!-- Main content -->
    <div class="prose max-w-none">
      <!-- ... article content ... -->
    </div>

    <!-- Add FAQ section di bawah content -->
    <SeoFaqSection
      :keyword="keyword"
      :show-cta="true"
      cta-label="Lihat Semua Artikel Tentang Lari"
      cta-url="/blog"
    />

    <!-- Add related keywords section -->
    <SeoRelatedKeywords :keyword="keyword" />
  </article>
</template>
```

### Pattern 4: Dynamic Pages (Location-based)

Generate SEO dynamically berdasarkan location:

```vue
<script setup lang="ts">
import { useSeoInjection } from '~/composables/useSeoInjection'

const route = useRoute()
const city = route.params.city as string // e.g., "bandung"

const { getKeywordsByType } = useSeoInjection()

// Get all location-based keywords
const locationKeywords = getKeywordsByType('local')

// Filter untuk kota tertentu
const cityKeyword = computed(() => {
  const map: Record<string, any> = {
    bandung: SEO_KEYWORDS.eventLariBandung,
    surabaya: SEO_KEYWORDS.eventLariSurabaya,
    yogyakarta: SEO_KEYWORDS.eventLariYogyakarta,
  }
  return map[city]
})
</script>
```

---

## SEO Benefits

### 1. **Targeted Keyword Coverage**

- Setiap keyword cluster ditargetkan di specific pages
- Primary keyword di H2/H3 untuk ranking
- Secondary keywords di content untuk long-tail traffic

### 2. **Internal Linking Strategy**

- Automatic link suggestions antara related pages
- Anchor text dengan keyword untuk SEO
- Breadcrumb navigation dengan keyword

### 3. **Rich Snippets (Schema.org)**

- FAQ Schema untuk featured snippets
- BreadcrumbList Schema untuk navigation
- CollectionPage Schema untuk listings

### 4. **Content Freshness**

- Dynamic subtitle dan descriptions
- FAQ questions generate dari keyword research
- Related links automatically updated

---

## Usage Examples

### Example 1: Homepage Hero Section dengan Keyword Injection

```vue
<script setup lang="ts">
import { useSeoInjection } from '~/composables/useSeoInjection'
import { SEO_KEYWORDS } from '~/utils/seoKeywords'

const { generateH2WithKeyword, generateSectionSubtitle } = useSeoInjection()

// Target main navigational keyword
const mainKeyword = SEO_KEYWORDS.eventLariIndonesia

const heroTitle = generateH2WithKeyword(mainKeyword, 'Jelajahi')
// Output: "Jelajahi Event Lari Indonesia 2025 di Indonesia"
</script>

<template>
  <section class="hero">
    <h1 class="text-5xl font-bold">{{ heroTitle }}</h1>
    <p class="text-xl">
      {{ generateSectionSubtitle(mainKeyword, 'feature') }}
    </p>
  </section>
</template>
```

### Example 2: Blog Listing dengan Related Keywords

```vue
<template>
  <div class="blog-listing">
    <h2>Panduan Lengkap Tentang Lari</h2>

    <!-- Blog posts -->
    <div class="grid">
      <!-- ... blog cards ... -->
    </div>

    <!-- Add FAQ section untuk "apa itu marathon", "pace adalah", etc -->
    <SeoFaqSection :keyword="SEO_KEYWORDS.marathon" />
    <SeoFaqSection :keyword="SEO_KEYWORDS.pace" />

    <!-- Add related keywords section -->
    <SeoRelatedKeywords :keyword="SEO_KEYWORDS.funRun" />
  </div>
</template>
```

### Example 3: Event Detail Page dengan Keyword Targeting

```vue
<script setup lang="ts">
import { SEO_KEYWORDS } from '~/utils/seoKeywords'

const event = ref({
  title: 'Borobudur Marathon 2025',
  // ...
})

// Auto-detect related keyword
const relatedKeyword = computed(() => {
  if (event.value.title.includes('Borobudur')) {
    return SEO_KEYWORDS.borobudurMarathon
  }
  if (event.value.title.includes('Jakarta')) {
    return SEO_KEYWORDS.jakartaMarathon
  }
  return SEO_KEYWORDS.marathonIndonesia
})
</script>

<template>
  <article>
    <!-- Event content -->

    <!-- Add FAQ section relevant to this event -->
    <SeoFaqSection :keyword="relatedKeyword" />

    <!-- Add related keywords -->
    <SeoRelatedKeywords :keyword="relatedKeyword" />
  </article>
</template>
```

---

## Checklist: Adding SEO Injection to Existing Sections

- [ ] Import `useSeoInjection` dan `SEO_KEYWORDS`
- [ ] Add `generateH2WithKeyword` untuk section heading
- [ ] Add `generateSectionSubtitle` untuk deskripsi
- [ ] Wrap section dalam semantic HTML (`<section>`, `<h2>`, dll)
- [ ] Add `SeoFaqSection` component di akhir section
- [ ] Add `SeoRelatedKeywords` component untuk internal linking
- [ ] Verify breadcrumb dengan keyword
- [ ] Test Schema.org dengan Google Rich Result Tester

---

## Adding New Keywords

Untuk tambah keyword baru:

1. **Add ke `utils/seoKeywords.ts`**:

```typescript
export const SEO_KEYWORDS: Record<string, KeywordCluster> = {
  // ... existing keywords ...

  newKeyword: {
    primary: 'New Keyword',
    secondaries: ['related 1', 'related 2', ...],
    relatedQuestions: ['Question 1?', 'Question 2?', ...],
    priority: 'high',
    targetPage: '/blog/new-keyword-slug',
    description: 'Description untuk SEO meta description...',
  },
}
```

2. **Use dalam component**:

```vue
<SeoFaqSection :keyword="SEO_KEYWORDS.newKeyword" />
```

---

## Performance Tips

1. **Lazy load FAQ sections** untuk long pages
2. **Use `maxItems` prop** untuk limit internal links (default: 3)
3. **Cache keyword database** di composable
4. **Monitor CTR** di Google Search Console untuk keyword targeting

---

## ⚠️ PEOPLE-FIRST IMPLEMENTATION GUIDELINES (Updated)

### 1. Context-Aware FAQ Generation

**Jangan**: Generate FAQ yang sama untuk event detail page seperti blog page.

**Lakukan**: Gunakan context parameter untuk customize FAQ:

```typescript
// Blog page - general FAQ
<SeoFaqSection 
  :keyword="SEO_KEYWORDS.marathon"
  :context="{ pageType: 'blog' }"
/>

// Event detail - event-specific FAQ
<SeoFaqSection 
  :keyword="SEO_KEYWORDS.marathon"
  :context="{ 
    pageType: 'event', 
    eventData: { 
      title: event.title,
      cutOffTime: event.cutOffTime,
      categories: event.categories
    }
  }"
  :max-items="3"
/>
```

**Result**: Event page akan punya FAQ tentang "Kapan cut off time?" (specific), bukan generic "Apa itu marathon?"

### 2. Limit SEO Blocks per Halaman

**Guardrails built-in**:

```typescript
// Automatic warnings di console (development mode)
⚠️ Terlalu banyak FAQ blocks (3). Idealnya max 1-2 per halaman.
⚠️ Keyword "Marathon" appears in 2 FAQ blocks. Make sure this is intentional.
⚠️ Total SEO blocks (5) terasa terlalu banyak. Jaga keseimbangan.
```

**Rule of thumb**:
- Max 1 FAQ block yang truly contextual
- Max 1 related keywords block (3 links max)
- FAQ answers > 100 chars, natural language

### 3. Answer Variability

**KeywordCluster sekarang support multiple answer templates**:

```typescript
answerTemplates: {
  'Apa itu marathon?': [
    'Marathon adalah lari jarak 42.195 km yang menguji ketahanan fisik...',
    'Marathon merupakan event lari yang mengukur stamina dan ketekunan...'
  ]
}
```

**Result**: Jawaban tidak selalu sama di setiap halaman yang pakai keyword ini.

### 4. Card Description Variability

**Sebelum** (repetitif):
```
"Eksplor topik X dan hubungannya dengan Y" (di semua card)
```

**Sesudah** (variatif):
```
"Pelajari lebih lanjut tentang X dan pengaruhnya terhadap Y"
"Temukan panduan praktis: X untuk meningkatkan performa Y"
"X adalah kunci dalam Y. Baca tips dan best practices"
```

### 5. Schema Validation

**Ensure schema === visible content** (no ghost FAQ):

```typescript
// Otomatis verify di component
if (visibleCount !== schemaCount) {
  console.warn(`Schema mismatch: ${visibleCount} FAQ visible, tapi schema punya ${schemaCount}`)
}
```

### 6. Type Safety dengan Hints

**Setiap keyword boleh punya hints untuk content creators**:

```typescript
marathon: {
  // ... existing fields ...
  hints: 'Untuk event detail, tanya tentang kategori jarak, cut off time. Jangan copy-paste dari blog.'
}
```

---

## Implementation Checklist (Updated)

- [ ] Extend keyword cluster dengan `contextualFaqs`, `description_variants`, `answerTemplates`, `hints`
- [ ] Pass `context` prop ke `SeoFaqSection` (pageType, eventData, city)
- [ ] Set `maxItems` prop untuk limit items (default: 3)
- [ ] Monitor console warnings di development mode
- [ ] Verify schema === visible content dengan Google Rich Result Tester
- [ ] Audit existing pages untuk double keywords, excessive blocks
- [ ] Document SEO strategy per page type (blog vs event vs listing)

---

## Monitoring

Setelah implementasi, monitor di Google Search Console:

- Impressions untuk each keyword
- CTR improvement
- Position trending untuk target keywords
- Coverage untuk all target pages
- **Baru**: Monitoring over-optimization signals (excessive blocks, thin content, template patterns)

---

## Helpful Resources

- [Creating Helpful, Reliable, People-First Content - Google](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Spam Policies - Google](https://developers.google.com/search/docs/essentials/spam-policies)
- [Structured Data Best Practices - Google](https://developers.google.com/search/docs/appearance/structured-data/)
