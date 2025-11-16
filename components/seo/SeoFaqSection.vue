<template>
  <section class="bg-surface py-10 border-t border-secondary/20">
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
        v-if="showCTA"
        class="flex justify-center pt-2"
      >
        <UiAppButton
          :to="ctaUrl"
          variant="secondary"
          size="md"
          :icon="IconHeroiconsArrowRight20Solid"
        >
          {{ ctaLabel }}
        </UiAppButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSeoInjection } from '~/composables/useSeoInjection'
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
  showCTA?: boolean
  ctaLabel?: string
  ctaUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  showCTA: true,
  ctaLabel: 'Lihat Semua Artikel',
  ctaUrl: '/blog',
})

const { generateH2WithKeyword, generateSectionSubtitle, generateFAQItems, generateFAQSchema } =
  useSeoInjection()

const expandedIndex = ref<number | null>(0) // Default expand first item

const h2Title = computed(() => generateH2WithKeyword(props.keyword, 'Tanya Jawab'))
const subtitle = computed(() => generateSectionSubtitle(props.keyword, 'related'))
const faqItems = computed(() => generateFAQItems(props.keyword))
const faqSchema = computed(() => generateFAQSchema(props.keyword))

// Inject schema when component mounts
onMounted(() => {
  injectFAQSchema(faqSchema.value)
})

const toggleItem = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index
}
</script>
