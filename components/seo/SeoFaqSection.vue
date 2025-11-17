<template>
  <section 
    data-seo-faq-section
    :data-keyword-id="props.dataKeywordId || keyword.primary"
    class="bg-surface py-10 border-t border-secondary/20"
  >
    <div class="layout-container space-y-10">
      <!-- Header -->
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-2xl lg:text-3xl font-bold text-primary tracking-tighter leading-[1.2]">
          {{ h2Title }}
        </h2>
        <p class="mt-4 text-gray-600 text-sm lg:text-base">
          {{ subtitle }}
        </p>
      </div>

      <!-- FAQ Accordion -->
      <div class="space-y-4 max-w-3xl mx-auto">
        <div
          v-for="(item, index) in faqItems"
          :key="index"
          class="rounded-2xl border border-secondary/30 bg-white transition-all duration-300"
        >
          <button
            class="w-full px-6 py-4 flex items-center justify-between text-left gap-4"
            @click="toggleItem(index)"
          >
            <span class="font-semibold text-primary leading-snug">{{ item.question }}</span>
            <IconMdiChevronDown
              class="h-6 w-6 text-secondary flex-shrink-0 transition-transform"
              :class="{ 'rotate-180': expandedIndex === index }"
            />
          </button>

          <!-- Answer -->
          <transition
            enter-active-class="transition-all duration-300 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[500px] opacity-100"
            leave-from-class="max-h-[500px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div
              v-if="expandedIndex === index"
              class="overflow-hidden"
            >
              <div class="px-6 pb-5 pt-2 border-t border-secondary/20">
                <p class="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
                  {{ item.answer }}
                </p>
                <NuxtLink
                  v-if="item.url"
                  :to="item.url"
                  class="inline-flex items-center gap-2 text-secondary font-semibold text-sm transition-all hover:gap-3"
                >
                  <span>Pelajari lebih lanjut</span>
                  <IconHeroiconsArrowRight20Solid class="h-4 w-4" />
                </NuxtLink>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- CTA Button -->
      <div
        v-if="showCtaButton"
        class="flex justify-center pt-2"
      >
        <UiAppButton
          :to="ctaLink"
          variant="secondary"
          size="md"
          :icon="IconHeroiconsArrowRight20Solid"
        >
          {{ ctaText }}
        </UiAppButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSeoInjection, type SeoContext } from '~/composables/useSeoInjection'
import { type KeywordCluster } from '~/utils/seoKeywords'
import IconMdiChevronDown from '~icons/mdi/chevron-down'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'

// Inject FAQ Schema for SEO
const injectFAQSchema = (schema: unknown) => {
  if (!schema) return

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      },
    ],
  })
}

interface Props {
  keyword: KeywordCluster
  context?: SeoContext
  dataKeywordId?: string
  maxItems?: number
  showCTA?: boolean
  ctaLabel?: string
  ctaUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  context: () => ({}),
  dataKeywordId: '',
  maxItems: 3,
  showCTA: true,
  ctaLabel: 'Lihat Semua Artikel',
  ctaUrl: '/blog',
})

interface GeneratedFaqItem {
  question: string
  answer: string
  url?: string
}

const { 
  generateH2WithKeyword, 
  generateSectionSubtitle, 
  generateFAQItems, 
  generateFAQSchema,
  validatePageSeoHealth
} = useSeoInjection()

const expandedIndex = ref<number | null>(0) // Default expand first item

const h2Title = computed(() => generateH2WithKeyword(props.keyword, 'Tanya Jawab'))
const subtitle = computed(() => generateSectionSubtitle(props.keyword, 'short'))

// PEOPLE-FIRST: Generate FAQ dengan context awareness
const faqItems = computed<GeneratedFaqItem[]>(() => {
  const allItems = generateFAQItems(props.keyword, props.context) as GeneratedFaqItem[]
  const limit = Number(props.maxItems) > 0 ? Number(props.maxItems) : 3
  return allItems.slice(0, limit)
})

const showCtaButton = computed(() => props.showCTA)
const ctaText = computed(() => props.ctaLabel)
const ctaLink = computed(() => props.ctaUrl)

// VALIDATION: Verify schema === visible content
const faqSchema = computed(() => {
  const schema = generateFAQSchema(faqItems.value)
  
  // Verify count
  if (import.meta.client && process.env.NODE_ENV === 'development') {
    const visibleCount = faqItems.value.length
    const schemaCount = (schema as { mainEntity?: Array<unknown> })?.mainEntity?.length ?? 0
    
    if (visibleCount !== schemaCount) {
      console.warn(
        `⚠️ [SeoFaqSection] Schema mismatch: ${visibleCount} FAQ visible, tapi schema punya ${schemaCount}. This violates Google structured data guidelines.`
      )
    }
  }
  
  return schema
})

// Inject schema when component mounts
onMounted(() => {
  injectFAQSchema(faqSchema.value)
  
  // GUARD: Warn jika multiple FAQ blocks dengan keyword yang sama
  if (props.dataKeywordId) {
    const otherFaqBlocks = document.querySelectorAll(
      `[data-keyword-id="${props.dataKeywordId}"]`
    )
    
    if (otherFaqBlocks.length > 1 && process.env.NODE_ENV === 'development') {
      console.warn(
        `⚠️ [SeoFaqSection] Keyword "${props.keyword.primary}" appears in ${otherFaqBlocks.length} FAQ blocks on this page. Make sure this is intentional and not over-optimization.`,
        'Hints:', props.keyword.hints
      )
    }
  }
  
  // GUARD: Validate overall page SEO health
  const faqBlocks = document.querySelectorAll('[data-seo-faq-section]').length
  const relatedKeywordBlocks = document.querySelectorAll('[data-seo-related-keywords]').length
  
  if (faqBlocks > 0 && process.env.NODE_ENV === 'development') {
    const health = validatePageSeoHealth('page', faqBlocks, relatedKeywordBlocks)
    
    if (!health.isHealthy) {
      health.warnings.forEach((w) => console.warn(w))
    }
  }
})

const toggleItem = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index
}
</script>
