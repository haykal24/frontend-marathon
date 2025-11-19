<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { createError } from 'h3'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useBlogPosts } from '~/composables/useBlogPosts'
import { useAdBanners } from '~/composables/useAdBanners'
import { formatBlogDate, calculateReadingTime } from '~/utils/format'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { BlogPost, BlogPostsResponse, BlogTag } from '~/types/blog'
import IconHeroiconsTag20Solid from '~icons/heroicons/tag-20-solid'
import IconHeroiconsCalendarDays20Solid from '~icons/heroicons/calendar-days-20-solid'
import IconHeroiconsUserCircle20Solid from '~icons/heroicons/user-circle-20-solid'
import IconHeroiconsShare20Solid from '~icons/heroicons/share-20-solid'
import IconHeroiconsClock20Solid from '~icons/heroicons/clock-20-solid'
import IconMdiContentCopy from '~icons/mdi/content-copy'
import IconMdiWhatsapp from '~icons/mdi/whatsapp'
import IconMdiFacebook from '~icons/mdi/facebook'
import IconMdiTwitter from '~icons/mdi/twitter'
import IconMdiInstagram from '~icons/mdi/instagram'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { ref } from 'vue'
import { useSchemaOrg, defineArticle } from '#imports'
import { SEO_KEYWORDS } from '~/utils/seoKeywords'
import SeoFaqSection from '~/components/seo/SeoFaqSection.vue'
import SeoRelatedKeywords from '~/components/seo/SeoRelatedKeywords.vue'

const route = useRoute()
const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchBlogPostBySlug, fetchBlogPosts } = useBlogPosts()
const { fetchResponsiveBanners } = useAdBanners()

const slug = computed(() => route.params.slug as string)

// --- Fetch blog post (best practice: await useAsyncData) ---
const { data: postResponse, error: postError } = await useAsyncData<{ data: BlogPost }>(
  `blog-post-${slug.value}`,
  () => fetchBlogPostBySlug(slug.value),
  { watch: [slug] }
)

const post = computed(() => postResponse.value?.data ?? null)

if (postError.value || !post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Artikel tidak ditemukan', fatal: true })
}

// --- SEO INJECTION LOGIC ---
// Cari tahu apakah halaman ini adalah pillar page berdasarkan slug
const pillarKeyword = computed(() => {
  const currentSlug = `/blog/${slug.value}`
  return Object.values(SEO_KEYWORDS).find(keyword => keyword.targetPage === currentSlug)
})

// --- Fetch related posts (best practice: await useAsyncData) ---
const { data: relatedResponse } = await useAsyncData<BlogPostsResponse>(
  `blog-related-${slug.value}`,
  async () => {
    // Ensure post data is available before fetching related
    if (!post.value?.category?.slug) {
      return { data: [], meta: { current_page: 1, last_page: 1, per_page: 4, total: 0 } }
    }

    // Try to fetch by category and tag first (if tag exists)
    if (post.value?.tags?.[0]?.slug) {
      const resultWithTag = await fetchBlogPosts({
        per_page: 4,
        category: post.value.category.slug,
        tag: post.value.tags[0].slug,
      })

      // If we got more than 1 result (excluding current post), return it
      if (resultWithTag.data && resultWithTag.data.length > 1) {
        return resultWithTag
      }
    }

    // Try: fetch by category only (latest)
    const resultByCategory = await fetchBlogPosts({
      per_page: 4,
      category: post.value.category.slug,
      sort: 'latest',
    })

    // If category has other articles (more than just current post), return it
    if (resultByCategory.data && resultByCategory.data.length > 1) {
      return resultByCategory
    }

    // Final fallback: fetch latest articles from ANY category (random/latest)
    const resultRandom = await fetchBlogPosts({
      per_page: 4,
      sort: 'latest',
    })

    return resultRandom
  },
  { watch: [slug, () => post.value?.category?.slug] }
)

const relatedPosts = computed<BlogPost[]>(() => {
  const items = relatedResponse.value?.data ?? []
  return items.filter(item => item.slug !== post.value?.slug)
})

// --- Header Background from Site Settings ---
const headerBg = computed(() => getImage('header_bg_blog', getImage('header_bg_events', null)))

const { data: blogDetailBanners } = await useAsyncData(`ad-banners-blog-detail-${slug.value}`, () =>
  fetchResponsiveBanners('page_header_blog_detail')
)
const headerAdBanners = computed(() => blogDetailBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => blogDetailBanners.value?.mobile ?? [])

// --- Article URL ---
const articleUrl = computed(() => `${config.public.siteUrl}/blog/${post.value?.slug ?? ''}`)

// --- SEO Meta Tags ---
const seoTitle = computed(() => post.value?.seo_title || post.value?.title || 'Artikel Blog')
const seoDescription = computed(
  () =>
    post.value?.seo_description ||
    post.value?.excerpt ||
    'Temukan insight terbaru seputar dunia lari di IndonesiaMarathon.com.'
)

// SEO: Meta tags dinamis untuk halaman blog
useSeoMetaDynamic({
  title: seoTitle.value,
  description: seoDescription.value,
  type: 'article',
  url: `/blog/${post.value?.slug}`,
})

// SEO: Override OG Image dengan banner artikel (fallback ke og.webp jika tidak ada)
if (post.value?.banner) {
  defineOgImage({
    url: post.value.banner,
    alt: `${post.value.title} - ${post.value.category?.name || 'Blog'}`,
    width: 1200,
    height: 630,
})
}
// Jika tidak ada banner, akan otomatis menggunakan og.webp dari config

// --- Article Schema.org ---
useSchemaOrg([
  defineArticle({
  headline: post.value?.title,
  description: seoDescription.value,
  datePublished: post.value?.published_at || undefined,
  dateModified: post.value?.updated_at || post.value?.published_at || undefined,
  author: post.value?.author
    ? {
        '@type': 'Person',
        name: post.value.author.name,
      }
    : undefined,
  url: articleUrl.value,
    image: post.value?.banner || undefined,
  }),
])

// --- Breadcrumbs ---
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Blog', link: '/blog' },
  { text: post.value?.title ?? 'Artikel', link: null },
])

// SEO: BreadcrumbList Schema.org untuk rich results
useBreadcrumbSchema(breadcrumbs)

// --- Formatted Data (using utils) ---
const formattedDate = computed(() => formatBlogDate(post.value?.published_at))
const readingTime = computed(() => calculateReadingTime(post.value?.content))
const tags = computed<BlogTag[]>(() => {
  const allTags = post.value?.tags ?? []
  // Backend already filters invalid tags, but add safety check
  return allTags.filter(tag => tag.name && tag.name.trim() !== '')
})

// --- Category Link ---
const categoryLink = computed(() =>
  post.value?.category?.slug ? `/blog?category=${post.value.category.slug}` : null
)

// --- Share Functionality ---
const shareUrl = computed(() => articleUrl.value)
const shareText = computed(
  () => `${post.value?.title ?? ''} - ${post.value?.category?.name ?? 'Blog'}`
)
const showSharePopover = ref(false)
const copyLinkSuccess = ref(false)

const copyLink = async () => {
  if (!process.client) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copyLinkSuccess.value = true
    setTimeout(() => {
      copyLinkSuccess.value = false
      showSharePopover.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

const shareWhatsApp = () => {
  if (!process.client) return
  const url = `https://wa.me/?text=${encodeURIComponent(`${shareText.value} ${shareUrl.value}`)}`
  window.open(url, '_blank', 'noopener,noreferrer')
  showSharePopover.value = false
}

const shareInstagram = () => {
  copyLink()
}

const shareFacebook = () => {
  if (!process.client) return
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank', 'noopener,noreferrer')
  showSharePopover.value = false
}

const shareX = () => {
  if (!process.client) return
  const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareText.value)}`
  window.open(url, '_blank', 'noopener,noreferrer')
  showSharePopover.value = false
}
</script>

<template>
  <div
    v-if="post"
    class="bg-surface min-h-screen"
  >
    <!-- Page Header -->
    <LayoutPageHeader
      :title="post.title"
      :description="post.excerpt || 'Artikel terbaru tentang dunia lari dan marathon.'"
      :breadcrumbs="breadcrumbs"
      :background-image-url="headerBg || undefined"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <!-- Main Content -->
    <section class="bg-surface py-10">
      <div class="layout-container">
        <div
          class="grid grid-cols-1 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)] gap-4 items-start"
        >
          <!-- Main Content Area -->
          <div class="flex flex-col gap-6">
            <!-- Article Card (Thumbnail + Meta + Content) -->
            <div class="rounded-2xl border border-secondary/30 bg-white shadow-sm overflow-hidden">
              <!-- Thumbnail with Category Overlay -->
              <figure class="relative overflow-hidden">
                <NuxtImg
                  v-if="post.banner"
                  :src="post.banner"
                  :alt="post.title"
                  format="webp"
                  loading="lazy"
                  class="h-full w-full max-h-[440px] object-cover"
                />
                <div
                  v-else
                  class="flex h-[260px] w-full items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-black text-white sm:h-[320px]"
                >
                  <span class="px-6 text-center text-xl font-semibold tracking-tight sm:text-2xl">
                    {{ post.title }}
                  </span>
                </div>

                <!-- Category Overlay (Bottom Right) -->
                <div
                  v-if="post.category"
                  class="absolute bottom-4 right-4"
                >
                  <NuxtLink
                    :to="categoryLink || '/blog'"
                    class="badge-modern inline-flex items-center gap-2 hover:bg-secondary/90 shadow-lg"
                  >
                    <IconHeroiconsTag20Solid class="h-4 w-4" />
                    {{ post.category.name }}
                  </NuxtLink>
                </div>
              </figure>

              <!-- Metadata & Content -->
              <div class="space-y-4 p-6">
                <!-- Metadata: Date, Reading Time, Author + Share Button (Desktop Space-Between) -->
                <div
                  class="flex items-start lg:items-center justify-between gap-4 flex-wrap lg:flex-nowrap"
                >
                  <!-- Left: Date, Reading Time, Author -->
                  <div
                    class="flex flex-col lg:flex-row lg:items-center lg:gap-4 gap-2 text-sm text-gray-600"
                  >
                    <div
                      v-if="formattedDate"
                      class="inline-flex items-center gap-2"
                    >
                      <IconHeroiconsCalendarDays20Solid
                        class="h-4 w-4 text-secondary flex-shrink-0"
                      />
                      <span class="font-medium text-xs lg:text-sm">{{ formattedDate }}</span>
                    </div>

                    <div
                      v-if="readingTime"
                      class="inline-flex items-center gap-2"
                    >
                      <IconHeroiconsClock20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
                      <span class="font-medium text-xs lg:text-sm">{{ readingTime }}</span>
                    </div>

                    <div
                      v-if="post.author"
                      class="inline-flex items-center gap-2"
                    >
                      <IconHeroiconsUserCircle20Solid
                        class="h-4 w-4 text-secondary flex-shrink-0"
                      />
                      <span class="font-medium text-xs lg:text-sm truncate">{{
                        post.author.name
                      }}</span>
                    </div>
                  </div>

                  <!-- Share Button (Mobile below metadata, Desktop right aligned) -->
                  <Popover
                    v-model="showSharePopover"
                    class="relative flex-shrink-0"
                  >
                    <PopoverButton
                      class="p-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-primary transition-colors"
                      title="Bagikan Artikel"
                    >
                      <IconHeroiconsShare20Solid class="h-5 w-5 text-secondary" />
                    </PopoverButton>

                    <PopoverPanel
                      class="absolute z-10 mt-2 w-56 rounded-xl border border-secondary bg-surface shadow-lg p-3 right-0"
                    >
                      <div class="space-y-1">
                        <button
                          class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors text-left text-sm"
                          @click="copyLink"
                        >
                          <IconMdiContentCopy class="h-4 w-4 text-gray-600 flex-shrink-0" />
                          {{ copyLinkSuccess ? 'Link disalin!' : 'Salin Link' }}
                        </button>
                        <button
                          class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors text-left text-sm"
                          @click="shareWhatsApp"
                        >
                          <IconMdiWhatsapp class="h-4 w-4 text-[#25D366] flex-shrink-0" />
                          WhatsApp
                        </button>
                        <button
                          class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors text-left text-sm"
                          @click="shareInstagram"
                        >
                          <IconMdiInstagram class="h-4 w-4 text-[#E1306C] flex-shrink-0" />
                          Instagram
                        </button>
                        <button
                          class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors text-left text-sm"
                          @click="shareFacebook"
                        >
                          <IconMdiFacebook class="h-4 w-4 text-[#1877F2] flex-shrink-0" />
                          Facebook
                        </button>
                        <button
                          class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors text-left text-sm"
                          @click="shareX"
                        >
                          <IconMdiTwitter class="h-4 w-4 text-gray-600 flex-shrink-0" />
                          X
                        </button>
                      </div>
                    </PopoverPanel>
                  </Popover>
                </div>

                <!-- Metadata Separator -->
                <div class="border-t border-secondary/50" />

                <!-- Article Content -->
                <article
                  class="text-sm lg:text-base prose prose-base max-w-none text-gray-700 prose-headings:text-primary prose-a:text-secondary prose-blockquote:border-secondary/40 prose-img:rounded-2xl prose-ol:list-decimal prose-ul:list-disc"
                >
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div v-html="post.content" />
                </article>

                <!-- Tags (Below Content) -->
                <div
                  v-if="tags.length"
                  class="border-t border-secondary/20 pt-4 flex flex-wrap items-center gap-2"
                >
                  <span class="text-xs uppercase tracking-[0.12em] text-gray-400 flex-shrink-0">
                    Tag
                  </span>
                  <div class="flex flex-wrap items-center gap-2">
                    <NuxtLink
                      v-for="tag in tags"
                      :key="tag.id"
                      :to="`/blog?tag=${tag.slug}`"
                      class="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/5 px-3 py-1 text-xs font-semibold text-primary transition hover:border-secondary/60 hover:bg-secondary/10"
                    >
                      <IconHeroiconsTag20Solid class="h-3 w-3 text-secondary" />
                      <span>{{ tag.name }}</span>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar: Related Articles -->
          <aside class="flex flex-col gap-6 lg:sticky lg:top-24">
            <div class="rounded-2xl border border-secondary/30 bg-white p-4 shadow-sm">
              <h3 class="text-base font-semibold text-primary tracking-tight">
                Artikel Terkait
              </h3>
              <div class="mt-2 space-y-4">
                <NuxtLink
                  v-for="related in relatedPosts"
                  :key="related.id"
                  :to="`/blog/${related.slug}`"
                  class="group flex gap-3 rounded-xl border border-secondary/30 bg-white/70 p-2 transition hover:border-secondary/60 hover:bg-secondary/5"
                >
                  <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary/10">
                    <NuxtImg
                      v-if="related.banner"
                      :src="related.banner"
                      :alt="related.title"
                      class="h-full w-full object-cover transition group-hover:scale-105"
                      format="webp"
                      loading="lazy"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/60 to-black text-xs text-white font-semibold"
                    >
                      Blog
                    </div>
                  </div>
                  <div class="flex flex-1 flex-col">
                    <span class="text-xs uppercase tracking-[0.12em] text-gray-400 mb-1">
                      {{ related.category?.name || 'Artikel' }}
                    </span>
                    <h4
                      class="text-sm font-semibold text-primary line-clamp-2 group-hover:text-secondary transition"
                    >
                      {{ related.title }}
                    </h4>
                    <span class="mt-1 text-[11px] text-gray-500">
                      {{ formatBlogDate(related.published_at) }}
                    </span>
                  </div>
                </NuxtLink>
                <p
                  v-if="!relatedPosts.length"
                  class="text-xs text-gray-500 text-center py-4"
                >
                  Belum ada artikel terkait.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- SEO Injection Sections -->
    <div
      v-if="pillarKeyword"
      class="space-y-10 lg:space-y-16"
    >
      <SeoFaqSection
        :keyword="pillarKeyword"
        :context="{ pageType: 'blog' }"
      />
      <SeoRelatedKeywords :keyword="pillarKeyword" />
    </div>
  </div>
</template>
