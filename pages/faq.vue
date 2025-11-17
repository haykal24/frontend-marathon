<template>
  <div class="bg-surface min-h-screen">
    <!-- Page Header -->
    <LayoutPageHeader
      :title="h2Title"
      :description="subtitle"
      :breadcrumbs="breadcrumbItems"
      :background-image-url="headerBg"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <!-- Main Content -->
    <section class="py-10">
      <div class="layout-container space-y-10">
        <!-- Category Pills -->
        <div class="rounded-2xl border border-secondary/30 bg-white p-4 sm:p-6">
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="text-base font-semibold text-primary tracking-tight">
                Jelajahi Topik FAQ
              </h2>
              <p class="text-xs text-gray-500">
                Pilih kategori untuk melihat jawaban yang relevan
              </p>
            </div>
            <div class="-mx-2 overflow-x-auto pb-2">
              <div class="flex items-center gap-2 px-2 min-w-full">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  :class="[
                    'px-4 py-2 rounded-full border text-sm font-semibold transition-all whitespace-nowrap',
                    selectedCategory === cat
                      ? 'bg-secondary text-primary border-secondary'
                      : 'bg-white text-gray-600 hover:text-primary border-secondary/40 hover:border-secondary',
                  ]"
                  @click="selectedCategory = cat"
                >
                  {{ formatCategoryName(cat) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div
          v-if="isLoading"
          class="space-y-4"
        >
          <div
            v-for="i in 4"
            :key="i"
            class="h-24 rounded-2xl border border-secondary/20 bg-white/70 shadow-sm animate-pulse"
          />
        </div>

        <!-- FAQ Accordion -->
        <div
          v-else
          class="space-y-4"
        >
          <div
            v-for="(faq, index) in filteredFAQs"
            :key="faq.id"
            class="rounded-2xl border border-secondary/30 bg-white transition-all duration-300 hover:border-secondary"
          >
            <button
              class="w-full px-6 py-4 flex items-center justify-between text-left gap-4"
              @click="toggleFAQ(index)"
            >
              <span class="font-semibold text-primary leading-snug">{{ faq.question }}</span>
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
                <div class="px-6 pb-6 pt-2 border-t border-secondary/20">
                  <p class="text-gray-700 text-sm lg:text-base leading-relaxed">
                    {{ faq.answer }}
                  </p>
                </div>
              </div>
            </transition>
          </div>

          <!-- Empty State -->
          <div
            v-if="filteredFAQs.length === 0"
            class="rounded-2xl border border-secondary/20 bg-white py-16 text-center shadow-sm"
          >
            <p class="text-gray-500">
              Belum ada FAQ untuk kategori ini.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { FAQ } from '~/types/faq'
import { useFAQ } from '~/composables/useFAQ'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import IconMdiChevronDown from '~icons/mdi/chevron-down'
import { useAdBanners } from '~/composables/useAdBanners'

const { fetchFAQs, fetchFAQCategories } = useFAQ()
const { getImage } = useSiteSettings()
const { fetchResponsiveBanners } = useAdBanners()

// SEO Meta
useSeoMetaDynamic({
  title: 'FAQ - Pertanyaan Jawaban Seputar Lari Marathon',
  description:
    'Tanya jawab lengkap tentang marathon, pace, fun run, trail run, dan informasi event lari di Indonesia.',
  url: '/faq',
})

// SEO: OG Image menggunakan fallback og.webp (static page)

// SEO: Schema.org FAQPage untuk rich results di Google
// CRITICAL: FAQPage schema harus memiliki mainEntity dengan Question/Answer array
// untuk memenuhi Google's FAQ rich results requirements
useSchemaOrg([
  defineWebPage({
    '@type': 'FAQPage',
    name: 'FAQ - Tanya Jawab Seputar Lari Marathon',
    description: 'Tanya jawab lengkap tentang marathon, pace, fun run, trail run, dan informasi event lari.',
    mainEntity: computed(() =>
      filteredFAQs.value.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      }))
    ),
  }),
])

// State
const faqs = ref<FAQ[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref<string>('marathon')
const expandedIndex = ref<number | null>(0)
const isLoading = ref(false)

// Header
const headerBg = computed(
  () => getImage('header_bg_faq', getImage('header_bg_events', null)) ?? undefined
)
const { data: faqHeaderBanners } = await useAsyncData('ad-banners-page-header-faq', () =>
  fetchResponsiveBanners('page_header_faq')
)
const headerAdBanners = computed(() => faqHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => faqHeaderBanners.value?.mobile ?? [])
const h2Title = computed(() => 'FAQ - Tanya Jawab Seputar Lari')
const subtitle = computed(() => 'Temukan jawaban lengkap untuk pertanyaan seputar marathon, pace, fun run, trail run, dan event lari di Indonesia.')

// Breadcrumb
const breadcrumbItems = computed<BreadcrumbItem[]>(() => [{ text: 'FAQ', link: null }])

// SEO: BreadcrumbList Schema.org untuk rich results
useBreadcrumbSchema(breadcrumbItems)

// Computed
const filteredFAQs = computed(() =>
  faqs.value.filter(faq => !selectedCategory.value || faq.category === selectedCategory.value)
)

// Methods
const toggleFAQ = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

const formatCategoryName = (cat: string): string => {
  const names: Record<string, string> = {
    marathon: 'Marathon',
    pace: 'Pace',
    cut_off: 'Cut Off',
    fun_run: 'Fun Run',
    trail_run: 'Trail Run',
    event: 'Event',
    website: 'Tentang Kami',
    general: 'Umum',
  }
  return names[cat] || cat
}

// Fetch data
const loadFAQs = async () => {
  isLoading.value = true
  try {
    const response = await fetchFAQs({ per_page: 100 })
    if (response.success) {
      faqs.value = response.data
    }
  } catch (error) {
    console.error('Error loading FAQs:', error)
  } finally {
    isLoading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await fetchFAQCategories()
    if (response.success) {
      categories.value = (response.data ?? []).filter(
        (cat): cat is string => typeof cat === 'string' && cat.length > 0
      )
      if (!categories.value.includes(selectedCategory.value) && categories.value.length > 0) {
        selectedCategory.value = categories.value[0] ?? 'marathon'
      }
    }
  } catch (error) {
    console.error('Error loading FAQ categories:', error)
  }
}

onMounted(() => {
  loadCategories()
  loadFAQs()
})
</script>
