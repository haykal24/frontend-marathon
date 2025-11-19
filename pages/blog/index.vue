<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { BlogPost, BlogCategory, BlogTag, BlogPostsResponse } from '~/types/blog'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useBlogPosts } from '~/composables/useBlogPosts'
import { useAdBanners } from '~/composables/useAdBanners'
import { formatEventDate } from '~/utils/format'
import IconMdiMagnify from '~icons/mdi/magnify'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconHeroiconsTag20Solid from '~icons/heroicons/tag-20-solid'
import IconHeroiconsCalendarDays20Solid from '~icons/heroicons/calendar-days-20-solid'
import IconHeroiconsUserCircle20Solid from '~icons/heroicons/user-circle-20-solid'
import AppFilterDropdown from '~/components/ui/AppFilterDropdown.vue'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchBlogPosts, fetchBlogCategories } = useBlogPosts()
const { fetchResponsiveBanners } = useAdBanners()

// --- Data & Filtering ---
const posts = ref<BlogPost[]>([])
const $img = useImage()

const buildImageUrl = (
  src?: string | null,
  modifiers: Record<string, number | string> = {},
) => {
  if (!src) return null
  return $img(src, {
    format: 'webp',
    quality: 80,
    ...modifiers,
  })
}

const getPostCardImage = (src?: string | null) =>
  buildImageUrl(src, { width: 256, height: 256 })
const categories = ref<BlogCategory[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const totalCount = ref(0)
const isLoading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<string>((route.query.category as string) || '')
const selectedTag = ref<string>((route.query.tag as string) || '')

// --- SEO Meta Tags ---
useSeoMetaDynamic({
  title: 'Blog Lari Indonesia - Panduan Marathon, Latihan, dan Tips Kesehatan',
  description:
    'Artikel lengkap lari marathon: panduan latihan, tips kesehatan, review perlengkapan, dan pembahasan teknik lari untuk pemula hingga advanced.',
  url: '/blog',
})

// SEO: OG Image menggunakan fallback og.webp (tidak perlu defineOgImage untuk listing)

// --- Schema.org CollectionPage ---
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/blog`,
    name: 'Blog Lari Indonesia',
    description: 'Artikel lengkap tentang lari marathon, teknik latihan, dan tips kesehatan',
  }),
  // OPTIMASI: Tambahkan ItemList untuk memberitahu Google konten dari halaman blog ini
  defineItemList({
    itemListElement: computed(() =>
      posts.value.slice(0, 10).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'BlogPosting',
          name: post.title,
          url: `${config.public.siteUrl}/blog/${post.slug}`,
        },
      }))
    ),
  }),
])

// --- Breadcrumb ---
const breadcrumbItems = computed<BreadcrumbItem[]>(() => [{ text: 'Blog', link: null }])

// SEO: BreadcrumbList Schema.org untuk rich results
useBreadcrumbSchema(breadcrumbItems)

// --- Header Background ---
const headerBg = computed(() => getImage('header_bg_blog', null) ?? undefined)

const { data: blogHeaderBanners } = await useAsyncData('ad-banners-page-header-blog', () =>
  fetchResponsiveBanners('page_header_blog')
)
const headerAdBanners = computed(() => blogHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => blogHeaderBanners.value?.mobile ?? [])

watch(
  () => route.query.category,
  newCategory => {
    selectedCategory.value = (newCategory as string) || ''
  }
)

watch(
  () => route.query.tag,
  newTag => {
    selectedTag.value = (newTag as string) || ''
  }
)

const perPage = 12

const categoryOptions = computed(() =>
  (categories.value || []).map(cat => ({
    value: cat.slug,
    label: cat.name,
  }))
)

const flattenedTags = computed<BlogTag[]>(() => posts.value.flatMap(post => post.tags ?? []))

const selectedTagLabel = computed(() => {
  if (!selectedTag.value) return ''
  const tag = flattenedTags.value.find(tag => tag.slug === selectedTag.value)
  if (tag?.name) return tag.name
  return selectedTag.value.replace(/-/g, ' ')
})

const clearSelectedTag = () => {
  selectedTag.value = ''
  fetchPostsData(1)
}

// --- Fetch Categories ---
const fetchCategoriesData = async () => {
  try {
    const res = await fetchBlogCategories()
    categories.value = res.data || []
  } catch (e) {
    console.error('Failed to fetch categories:', e)
  }
}

// --- Fetch Posts ---
const fetchPostsData = async (page = 1, append = false) => {
  isLoading.value = true
  try {
    const res = await fetchBlogPosts({
      page,
      per_page: perPage,
      search: searchQuery.value || undefined,
      category: selectedCategory.value || undefined,
      tag: selectedTag.value || undefined,
    })

    const items = res.data ?? []
    posts.value = append ? [...posts.value, ...items] : items

    const pagination = (res as BlogPostsResponse).meta
    currentPage.value = pagination?.current_page ?? 1
    lastPage.value = pagination?.last_page ?? 1
    totalCount.value = pagination?.total ?? items.length ?? 0

    // Update URL query params
    const query: Record<string, string> = {}
    if (selectedCategory.value) query.category = selectedCategory.value
    if (selectedTag.value) query.tag = selectedTag.value
    if (searchQuery.value) query.search = searchQuery.value
    if (page > 1) query.page = String(page)

    router.push({ query })
  } catch (e) {
    console.error('Failed to fetch posts:', e)
  } finally {
    isLoading.value = false
  }
}

// --- Lifecycle ---
onMounted(() => {
  fetchCategoriesData()

  const page = parseInt(route.query.page as string) || 1
  searchQuery.value = (route.query.search as string) || ''
  selectedCategory.value = (route.query.category as string) || ''

  fetchPostsData(page)
})

// --- Watch for filter changes ---
const debouncedSearch = useDebounceFn(async () => {
  currentPage.value = 1
  await fetchPostsData(1)
}, 300)

watch([searchQuery, selectedCategory, selectedTag], () => {
  debouncedSearch()
})

// --- Load More ---
const loadMore = async () => {
  if (currentPage.value < lastPage.value) {
    await fetchPostsData(currentPage.value + 1, true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <LayoutPageHeader
      title="Blog Lari Indonesia"
      description="Panduan lengkap soal lari marathon: tips latihan, review perlengkapan, sampai strategi finish kuat."
      :breadcrumbs="breadcrumbItems"
      :background-image-url="headerBg"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <!-- Main Content -->
    <div class="layout-container py-10">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <!-- Main Content Area -->
        <div class="lg:col-span-3">
          <!-- Search & Filter -->
          <div class="space-y-4 mb-4">
            <div class="flex items-center gap-2 sm:gap-3 flex-nowrap">
              <!-- Search -->
              <div class="relative flex-1 min-w-0">
                <IconMdiMagnify
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari artikel..."
                  class="w-full rounded-lg border border-secondary/60 bg-white py-2.5 pl-10 pr-4 h-10 placeholder-gray-400 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition"
                >
              </div>

              <!-- Category Filter Dropdown -->
              <div
                v-if="categoryOptions.length > 0"
                class="shrink-0 w-36 sm:w-48 md:w-64"
              >
                <AppFilterDropdown
                  v-model="selectedCategory"
                  :options="categoryOptions"
                  placeholder="Semua Kategori"
                />
              </div>
            </div>
          </div>

          <div
            v-if="selectedTagLabel"
            class="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-white px-3 py-1.5 text-xs font-medium text-primary shadow-sm"
          >
            <span class="inline-flex items-center gap-1.5">
              <IconHeroiconsTag20Solid class="h-3.5 w-3.5 text-secondary" />
              <span>Tag: {{ selectedTagLabel }}</span>
            </span>
            <button
              type="button"
              class="text-gray-500 transition hover:text-secondary"
              @click="clearSelectedTag"
            >
              ×
            </button>
          </div>

          <!-- Total Count & Pagination Info -->
          <div
            v-if="(totalCount > 0 || posts.length > 0) && !isLoading"
            class="flex items-center justify-between gap-3 pb-4 border-b border-secondary/20 text-sm text-gray-600"
          >
            <span>Total {{ totalCount }} artikel</span>
            <span class="text-gray-500">Halaman {{ currentPage }} dari {{ lastPage }}</span>
          </div>

          <!-- Posts Grid -->
          <div
            v-if="!isLoading && posts.length > 0"
            class="space-y-4 mb-8"
          >
            <!-- Blog Post Card -->
            <div
              v-for="post in posts"
              :key="post.id"
              class="bg-white rounded-2xl border border-secondary p-6 hover:border-secondary/70 transition-colors"
            >
              <div class="flex gap-6">
                <!-- Post Image -->
                <div class="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden bg-gray-100">
                  <template v-if="post.banner">
                    <img
                      v-if="getPostCardImage(post.banner)"
                      :src="getPostCardImage(post.banner) ?? undefined"
                      :alt="post.title"
                      class="w-full h-full object-cover"
                      width="256"
                      height="256"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    >
                  </template>
                  <template v-else>
                    <div
                      class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-black text-white"
                    >
                      <span class="text-sm font-semibold tracking-tight">Blog</span>
                    </div>
                  </template>
                </div>

                <!-- Post Content -->
                <div class="flex-1 min-w-0">
                  <!-- Category Badge -->
                  <div
                    v-if="post.category"
                    class="mb-2"
                  >
                    <span class="badge-modern inline-flex items-center gap-2 text-xs">
                      <IconHeroiconsTag20Solid class="h-3.5 w-3.5" />
                      {{ post.category.name }}
                    </span>
                  </div>

                  <!-- Title & Excerpt -->
                  <NuxtLink
                    :to="`/blog/${post.slug}`"
                    class="group"
                  >
                    <h3
                      class="lg:text-lg text-base font-bold text-primary mb-2 group-hover:text-secondary transition"
                    >
                      {{ post.title }}
                    </h3>
                  </NuxtLink>

                  <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                    {{ post.excerpt || post.content?.substring(0, 150) }}...
                  </p>

                  <!-- Meta Info -->
                  <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <div class="inline-flex items-center gap-1.5 leading-none">
                      <IconHeroiconsCalendarDays20Solid
                        class="h-4 w-4 text-secondary flex-shrink-0"
                      />
                      <span class="text-gray-600">{{ formatEventDate(post.published_at) }}</span>
                    </div>
                    <div
                      v-if="post.author"
                      class="inline-flex items-center gap-1.5 leading-none max-w-[65%]"
                    >
                      <IconHeroiconsUserCircle20Solid
                        class="h-4 w-4 text-secondary flex-shrink-0"
                      />
                      <span class="truncate text-gray-600">{{ post.author.name }}</span>
                    </div>
                  </div>

                  <!-- Read More Link -->
                  <NuxtLink
                    :to="`/blog/${post.slug}`"
                    class="inline-flex items-center gap-2 mt-4 text-sm text-secondary hover:text-secondary/70 font-medium transition"
                  >
                    Baca Selengkapnya
                    <IconHeroiconsArrowRight20Solid class="h-4 w-4" />
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading Skeleton -->
          <div
            v-if="isLoading"
            class="space-y-4"
          >
            <div
              v-for="i in 3"
              :key="i"
              class="bg-white rounded-2xl border border-secondary p-6 animate-pulse"
            >
              <div class="flex gap-6">
                <div class="flex-shrink-0 w-32 h-32 rounded-xl bg-gray-200" />
                <div class="flex-1 space-y-3">
                  <div class="h-4 bg-gray-200 rounded w-1/4" />
                  <div class="h-5 bg-gray-200 rounded w-3/4" />
                  <div class="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="!isLoading && posts.length === 0"
            class="text-center py-12"
          >
            <p class="text-gray-500 text-lg">
              Belum ada artikel untuk filter ini.
            </p>
          </div>

          <!-- Pagination Info & Load More -->
          <div
            v-if="posts.length > 0"
            class="flex items-center justify-center pt-6 border-t border-secondary/20"
          >
            <button
              v-if="currentPage < lastPage"
              :disabled="isLoading"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-primary font-medium hover:bg-secondary/90 transition disabled:opacity-50"
              @click="loadMore"
            >
              <span v-if="isLoading">Memuat...</span>
              <span v-else>Muat Lebih Banyak</span>
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-6">
            <!-- Categories Summary -->
            <div
              class="rounded-2xl border border-secondary/40 bg-white/90 backdrop-blur-sm p-6 shadow-sm"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="lg:text-lg text-base font-bold text-primary tracking-tight">
                  Telusuri Kategori
                </h3>
                <span
                  class="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-secondary/20 text-primary"
                >
                  <IconMdiTagMultipleOutline class="h-4 w-4" />
                </span>
              </div>

              <p class="text-xs text-gray-500 mb-4">
                Pilih topik favoritmu untuk eksplor artikel lari yang paling relevan.
              </p>

              <ul class="space-y-2">
                <li
                  v-for="cat in categories"
                  :key="cat.slug"
                >
                  <NuxtLink
                    :to="`/blog?category=${cat.slug}`"
                    class="group flex items-center justify-between gap-3 rounded-xl border border-secondary/30 bg-white/80 px-3 py-2 text-sm font-semibold text-primary transition hover:border-secondary hover:bg-secondary/10"
                  >
                    <span class="inline-flex items-center gap-2">
                      <span
                        class="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-secondary/30 text-primary"
                      >
                        <IconMdiTagMultipleOutline class="h-3.5 w-3.5" />
                      </span>
                      {{ cat.name }}
                    </span>
                    <IconHeroiconsArrowRight20Solid
                      class="h-4 w-4 text-secondary transition group-hover:translate-x-1"
                    />
                  </NuxtLink>
                </li>
                <li
                  v-if="!categories.length"
                  class="rounded-xl border border-dashed border-secondary/30 bg-white/70 px-4 py-6 text-center text-sm text-gray-500"
                >
                  Kategori belum tersedia — pantau terus untuk update artikel terbaru.
                </li>
              </ul>
            </div>

            <!-- Newsletter CTA -->
            <div
              class="rounded-2xl border border-secondary/40 bg-gradient-to-br from-secondary/15 via-white to-white p-6 shadow-sm"
            >
              <h3 class="font-bold text-primary mb-2 tracking-tight">
                Update Artikel Terbaru
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Dapatkan tips lari, panduan latihan, dan insight event terbaru langsung ke inbox-mu.
              </p>
              <div class="space-y-2">
                <input
                  type="email"
                  placeholder="Email kamu"
                  class="w-full px-3 py-2.5 rounded-lg border border-secondary/60 bg-white text-sm placeholder-gray-400 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition"
                >
                <UiAppButton
                  variant="secondary"
                  size="sm"
                  block
                >
                  Subscribe
                </UiAppButton>
              </div>
              <p class="mt-3 text-[11px] text-gray-500">
                Kami kirim 1x seminggu. Gratis. Bisa berhenti kapan saja.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
