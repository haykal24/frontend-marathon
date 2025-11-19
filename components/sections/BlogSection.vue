<script setup lang="ts">
import { computed } from 'vue'
import type { BlogPost } from '~/types/blog'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'
import IconHeroiconsTag20Solid from '~icons/heroicons/tag-20-solid'
import IconHeroiconsCalendarDays20Solid from '~icons/heroicons/calendar-days-20-solid'
import IconHeroiconsUserCircle20Solid from '~icons/heroicons/user-circle-20-solid'
import { useCurrentYear } from '~/composables/useCurrentYear'

const { currentYear } = useCurrentYear()

interface Props {
  posts: BlogPost[]
  title?: string
  showViewAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Pahami Lari: Apa itu Pace, Cut Off, dan Marathon?',
  showViewAll: true,
})

const posts = computed(() => props.posts ?? [])
const sectionTitle = computed(() => props.title)
const showViewAll = computed(() => props.showViewAll)

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const sliderOptions = {
  type: 'loop',
  perPage: 1,
  perMove: 1,
  gap: '1.5rem',
  padding: { left: '0', right: '20%' },
  focus: 'left',
  pagination: true,
  arrows: false,
  autoplay: false,
  drag: true,
  snap: true,
  speed: 600,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  breakpoints: {
    768: {
      perPage: 1,
      gap: '1rem',
      padding: { left: '0', right: '15%' },
    },
    1024: {
      perPage: 2,
      gap: '1.25rem',
      padding: { left: '0', right: '15%' },
    },
    1280: {
      perPage: 3,
      gap: '1.5rem',
      padding: { left: '0', right: '10%' },
    },
  },
}
</script>

<template>
  <section class="bg-surface py-10">
    <div class="layout-container">
      <div
        class="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-4"
      >
        <div class="max-w-4xl">
          <span class="badge-modern inline-flex items-center gap-2 w-fit">
            <IconHeroiconsSparkles20Solid class="h-4 w-4" />
            Artikel Terbaru
          </span>
          <h2
            class="mt-4 text-xl lg:text-2xl font-bold text-primary tracking-tighter leading-tight mb-2"
          >
            {{ sectionTitle }}
          </h2>
          <p class="text-sm lg:text-base text-gray-600 leading-relaxed">
            Upgrade pengetahuan lari kamu untuk tahun {{ currentYear }}. Pelajari tips trail
            running, apa artinya fun run, hingga cara menghitung pace lari idealmu di sini.
          </p>
        </div>

        <UiAppButton
          v-if="showViewAll"
          to="/blog"
          variant="primary"
          size="sm"
          class="self-start lg:w-auto"
          :icon="IconHeroiconsArrowRight20Solid"
        >
          Semua Artikel
        </UiAppButton>
      </div>

      <Splide
        v-if="posts.length > 0"
        :options="sliderOptions"
        class="blog-splide"
      >
        <SplideSlide
          v-for="post in posts"
          :key="post.id"
          class="h-full"
        >
          <NuxtLink
            :to="`/blog/${post.slug}`"
            class="group flex h-full flex-col overflow-hidden rounded-2xl border border-secondary/40 bg-white"
          >
            <div class="relative h-48 overflow-hidden">
              <NuxtImg
                v-if="post.banner"
                :src="post.banner"
                :alt="post.title"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                format="webp"
                loading="lazy"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-black text-white"
              >
                <span class="text-lg font-semibold tracking-tight">Blog</span>
              </div>
              <div
                class="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/15 to-transparent"
              />
              <span
                v-if="post.category"
                class="badge-modern absolute bottom-4 left-4 inline-flex items-center gap-2"
              >
                <IconHeroiconsTag20Solid class="h-4 w-4" />
                {{ post.category.name }}
              </span>
            </div>

            <div class="flex flex-1 flex-col gap-4 p-5 md:p-6">
              <h3 class="text-lg font-semibold text-primary leading-snug line-clamp-2">
                {{ post.title }}
              </h3>

              <p
                v-if="post.excerpt"
                class="text-sm text-gray-600 leading-relaxed line-clamp-3"
              >
                {{ post.excerpt }}
              </p>

              <div
                class="mt-auto flex flex-wrap items-center gap-3 border-t border-secondary/20 pt-4 text-xs text-gray-500"
              >
                <div
                  v-if="post.author"
                  class="inline-flex items-center gap-1.5 max-w-[65%]"
                >
                  <IconHeroiconsUserCircle20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
                  <span class="truncate text-primary/80 font-medium">{{ post.author.name }}</span>
                </div>
                <div
                  v-if="post.published_at"
                  class="inline-flex items-center gap-1.5"
                >
                  <IconHeroiconsCalendarDays20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
                  <span class="text-[11px] uppercase tracking-[0.12em]">{{
                    formatDate(post.published_at)
                  }}</span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </SplideSlide>
      </Splide>

      <div
        v-else
        class="rounded-2xl border border-dashed border-secondary/40 bg-white/70 py-10 text-center text-sm text-gray-500"
      >
        Belum ada artikel tersedia.
      </div>
    </div>
  </section>
</template>

<style scoped lang="postcss">
.blog-splide {
  @apply relative pb-8;
}

.blog-splide :deep(.splide__pagination) {
  @apply absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-4 flex gap-2;
}

.blog-splide :deep(.splide__pagination__page) {
  @apply h-2 w-2 rounded-full bg-primary/15 transition duration-300;
}

.blog-splide :deep(.splide__pagination__page.is-active) {
  @apply w-8 rounded-full bg-secondary;
}
</style>
