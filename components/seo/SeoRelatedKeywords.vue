<template>
  <section class="bg-white py-10">
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

      <!-- Keyword Links Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="(card, index) in cards"
          :key="index"
          class="group flex flex-col justify-between gap-4 p-6 rounded-2xl border border-secondary/30 bg-surface transition-colors hover:border-secondary"
        >
          <div class="space-y-3">
            <span
              class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary"
            >
              <span
                class="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/20 text-primary font-bold"
              >{{ index + 1 }}</span>
              Rekomendasi
            </span>
            <h3 class="text-lg font-bold text-primary leading-tight group-hover:text-secondary">
              {{ card.title }}
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              {{ card.description }}
            </p>
          </div>

          <UiAppButton
            :to="card.url"
            variant="secondary"
            size="sm"
            class="self-start"
            :icon="IconHeroiconsArrowRight20Solid"
          >
            Baca Selengkapnya
          </UiAppButton>
        </article>
      </div>

      <!-- Secondary Keywords as Badges -->
      <div class="pt-10 border-t border-secondary/20">
        <p class="text-xs uppercase tracking-[0.12em] text-gray-500 mb-4 text-center lg:text-left">
          Topik terkait lainnya
        </p>
        <div class="flex flex-wrap gap-3 justify-center lg:justify-start">
          <span
            v-for="(secondary, index) in keyword.secondaries"
            :key="index"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface text-primary text-xs sm:text-sm font-medium border border-secondary/30"
          >
            <IconHeroiconsTag20Solid class="h-4 w-4 text-secondary" />
            {{ secondary }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSeoInjection } from '~/composables/useSeoInjection'
import { type KeywordCluster } from '~/utils/seoKeywords'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconHeroiconsTag20Solid from '~icons/heroicons/tag-20-solid'

interface Props {
  keyword: KeywordCluster
}

const props = defineProps<Props>()

const { generateH2WithKeyword, generateSectionSubtitle, generateInternalLinks } = useSeoInjection()

const h2Title = computed(() => generateH2WithKeyword(props.keyword, 'Pelajari Juga'))
const subtitle = computed(() => generateSectionSubtitle(props.keyword, 'related'))
const internalLinks = computed(() => generateInternalLinks(props.keyword, 3))

const cards = computed(() =>
  internalLinks.value.map(link => ({
    title: link.text.replace(/\b[a-z]/, char => char.toUpperCase()),
    description: `Eksplor topik ${link.text} dan hubungannya dengan ${props.keyword.primary}.`,
    url: link.url,
  }))
)
</script>
