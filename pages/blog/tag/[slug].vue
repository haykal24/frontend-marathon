<script setup lang="ts">
/**
 * Halaman Landing Page Dinamis - Blog berdasarkan Tag
 * 
 * URL: /blog/tag/marathon
 * SEO Strategy: Programmatic SEO untuk ranking #1 keyword tag
 * TIDAK ADA DI NAVIGATION - hanya untuk breadcrumb & sitemap
 */

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { createError } from 'h3'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useBlogPosts } from '~/composables/useBlogPosts'
import { useAdBanners } from '~/composables/useAdBanners'
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { BlogPost } from '~/types/blog'
import IconHeroiconsTag20Solid from '~icons/heroicons/tag-20-solid'
import IconHeroiconsCalendarDays20Solid from '~icons/heroicons/calendar-days-20-solid'
import IconHeroiconsUserCircle20Solid from '~icons/heroicons/user-circle-20-solid'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import { formatBlogDate } from '~/utils/format'
import { useImage } from '#imports'
import { useSchemaOrg, defineWebPage, defineItemList } from '#imports'

const route = useRoute()
const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchBlogPosts, fetchBlogTags } = useBlogPosts()
const { fetchResponsiveBanners } = useAdBanners()
const $img = useImage()

const tagSlug = route.params.slug as string

// Fetch tag info (to get tag name)
const { data: tagsData } = await useAsyncData('blog-tags-all', () => fetchBlogTags())
const tagInfo = computed(() => {
  const allTags = tagsData.value?.data ?? []
  return allTags.find(t => t.slug === tagSlug) || null
})

if (!tagInfo.value) {
  throw createError({ statusCode: 404, statusMessage: 'Tag tidak ditemukan', fatal: true })
}

// Fetch posts for this tag
const { data: postsData } = await useAsyncData(
  `blog-posts-tag-${tagSlug}`,
  async () => {
    return await fetchBlogPosts({
      tag: tagSlug,
      per_page: 50,
      sort: 'latest',
    })
  }
)

const posts = computed<BlogPost[]>(() => postsData.value?.data ?? [])
const totalPosts = computed(() => postsData.value?.meta?.pagination?.total ?? 0)

// SEO
const tagName = computed(() => tagInfo.value?.name || 'Artikel')
const seoTitle = computed(() => 
  `Artikel Tag ${tagName.value} - Blog Lari Indonesia`
)
const seoDescription = computed(() => 
  `Kumpulan ${totalPosts.value}+ artikel bertopik ${tagName.value} untuk pelari Indonesia: panduan latihan, tips gear, dan strategi finish kuat. Update setiap hari!`
)

useSeoMetaDynamic({
  title: seoTitle.value,
  description: seoDescription.value,
  url: `/blog/tag/${tagSlug}`,
  type: 'website',
})

// Schema.org: CollectionPage
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/blog/tag/${tagSlug}`,
    name: seoTitle.value,
    description: seoDescription.value,
    '@type': 'CollectionPage',
  }),
  // ItemList untuk SEO
  defineItemList({
    itemListElement: computed(() =>
      posts.value.slice(0, 20).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'BlogPosting',
          headline: post.title,
          name: post.title,
          description: post.excerpt || post.seo_description || post.title,
          url: `${config.public.siteUrl}/blog/${post.slug}`,
          datePublished: post.published_at ? new Date(post.published_at).toISOString() : undefined,
          dateModified: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
          author: post.author ? {
            '@type': 'Person',
            name: post.author.name,
          } : undefined,
          image: post.banner 
            ? (post.banner.startsWith('http') ? post.banner : `${config.public.siteUrl}${post.banner}`)
            : undefined,
        },
      }))
    ),
  }),
])

// Breadcrumbs (Home otomatis ditambahkan oleh komponen Breadcrumb)
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Blog', link: '/blog' },
  { text: 'Tag', link: '/blog/tag' },
  { text: tagName.value, link: null },
])

useBreadcrumbSchema(breadcrumbs)

// Header
const headerBg = computed(() => getImage('header_bg_blog', null) ?? undefined)

const { data: blogHeaderBanners } = await useAsyncData(`ad-banners-blog-header-tag-${tagSlug}`, () =>
  fetchResponsiveBanners('page_header_blog')
)
const headerAdBanners = computed(() => blogHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => blogHeaderBanners.value?.mobile ?? [])

// Image helpers
const buildImageUrl = (src?: string | null) => {
  if (!src) return null
  return $img(src, {
    format: 'webp',
    quality: 80,
    width: 256,
    height: 256,
  })
}

const getPostCardImage = (src?: string | null) => buildImageUrl(src)
</script>

<template>
  <div>
    <!-- Page Header -->
    <LayoutPageHeader
      :title="`Artikel Tag ${tagName}`"
      :description="`${totalPosts} artikel bertopik ${tagName} untuk pelari Indonesia`"
      :breadcrumbs="breadcrumbs"
      :background-image-url="headerBg"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <!-- Main Content -->
    <section class="bg-surface py-10">
      <div class="layout-container">
        <!-- Total Count & Pagination Info -->
        <div
          v-if="posts.length > 0"
          class="flex items-center justify-between gap-3 pb-4 border-b border-secondary/20 text-sm text-gray-600 mb-4"
        >
          <span>Total {{ totalPosts }} artikel</span>
        </div>

        <!-- Posts List View (Sama seperti blog/index.vue) -->
        <div
          v-if="posts.length > 0"
          class="space-y-4 mb-8"
        >
          <!-- Blog Post Card (Sama seperti blog/index.vue) -->
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
                    class="lg:text-lg text-base font-bold text-primary mb-2 group-hover:text-secondary transition line-clamp-2"
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
                    <span class="text-gray-600">{{ formatBlogDate(post.published_at) }}</span>
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

        <!-- Empty State -->
        <div
          v-if="posts.length === 0"
          class="text-center py-16 text-gray-500"
        >
          <p>Belum ada artikel untuk tag ini.</p>
        </div>

        <!-- Silo Structure Links -->
        <div
          v-if="posts.length > 0"
          class="mt-12 rounded-2xl border border-secondary/30 bg-white p-6"
        >
          <h3 class="text-lg font-bold text-primary mb-4 tracking-tight">
            Jelajahi Artikel Lain
          </h3>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <NuxtLink
              to="/blog"
              class="flex items-center gap-3 rounded-xl border border-secondary/30 bg-surface p-3 text-sm font-semibold text-primary transition hover:bg-surface/80"
            >
              <IconHeroiconsArrowRight20Solid class="h-4 w-4 text-secondary" />
              Lihat Semua Artikel
            </NuxtLink>
            <NuxtLink
              to="/blog/tag"
              class="flex items-center gap-3 rounded-xl border border-secondary/30 bg-surface p-3 text-sm font-semibold text-primary transition hover:bg-surface/80"
            >
              <IconHeroiconsTag20Solid class="h-4 w-4 text-secondary" />
              Lihat Semua Tag
            </NuxtLink>
            <NuxtLink
              to="/blog/kategori"
              class="flex items-center gap-3 rounded-xl border border-secondary/30 bg-surface p-3 text-sm font-semibold text-primary transition hover:bg-surface/80"
            >
              <IconHeroiconsTag20Solid class="h-4 w-4 text-secondary" />
              Lihat Semua Kategori
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

