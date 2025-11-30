<script setup lang="ts">
/**
 * Halaman INDEX Tag Blog - Listing semua tag yang punya artikel
 * 
 * URL: /blog/tag
 * SEO Strategy: Hub page untuk internal linking & breadcrumb hierarchy
 * TIDAK ADA DI NAVIGATION - hanya untuk breadcrumb & sitemap
 */

import { computed } from 'vue'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useBlogPosts } from '~/composables/useBlogPosts'
import { useAdBanners } from '~/composables/useAdBanners'
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { BlogTag } from '~/types/blog'
import IconHeroiconsTag20Solid from '~icons/heroicons/tag-20-solid'

const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchBlogTags } = useBlogPosts()
const { fetchResponsiveBanners } = useAdBanners()

// Fetch tags with post counts
const { data: tagsData } = await useAsyncData('blog-tags-with-counts', () => fetchBlogTags())
const tags = computed<(BlogTag & { post_count?: number })[]>(() => tagsData.value?.data ?? [])

// SEO
const currentYear = new Date().getFullYear()
const seoTitle = `Tag Blog Lari ${currentYear} - Artikel Berdasarkan Topik`
const seoDescription = `Jelajahi ${tags.value.length}+ tag artikel lari di Indonesia. Temukan artikel berdasarkan topik favoritmu: marathon, latihan, gear, dan tips kesehatan.`

useSeoMetaDynamic({
  title: seoTitle,
  description: seoDescription,
  url: '/blog/tag',
  type: 'website',
})

// Schema.org
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/blog/tag`,
    name: seoTitle,
    description: seoDescription,
    '@type': 'CollectionPage',
  }),
])

// Breadcrumbs (Home otomatis ditambahkan oleh komponen Breadcrumb)
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Blog', link: '/blog' },
  { text: 'Tag', link: '/blog/tag' },
])

useBreadcrumbSchema(breadcrumbs)

// Header
const headerBg = computed(() => getImage('header_bg_blog', null) ?? undefined)
const { data: blogHeaderBanners } = await useAsyncData('ad-banners-blog-header-tag', () =>
  fetchResponsiveBanners('page_header_blog')
)
const headerAdBanners = computed(() => blogHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => blogHeaderBanners.value?.mobile ?? [])
</script>

<template>
  <div>
    <!-- Page Header -->
    <LayoutPageHeader
      title="Tag Blog Lari"
      :description="`Jelajahi ${tags.length} tag artikel lari di Indonesia`"
      :breadcrumbs="breadcrumbs"
      :background-image-url="headerBg"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <!-- Main Content -->
    <section class="bg-surface py-10">
      <div class="layout-container">
        <!-- Intro -->
        <div class="mb-8 text-center max-w-3xl mx-auto">
          <h2 class="text-2xl font-bold text-primary mb-3 font-saira tracking-tight">
            Pilih Tag untuk Melihat Artikel
          </h2>
          <p class="text-gray-600">
            Temukan artikel blog berdasarkan topik favoritmu. Filter artikel berdasarkan tag yang paling relevan.
          </p>
        </div>

        <!-- Tags Grid (Styling seperti EventTypeSection) -->
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <NuxtLink
            v-for="tag in tags"
            :key="tag.id"
            :to="`/blog/tag/${tag.slug}`"
            class="group relative rounded-2xl border border-secondary/30 bg-white p-4 text-center transition hover:border-secondary hover:bg-surface/80"
          >
            <div class="flex flex-col items-center gap-2">
              <span
                class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20 text-primary transition group-hover:bg-secondary/30"
              >
                <IconHeroiconsTag20Solid class="h-6 w-6" />
              </span>
              <h3 class="text-sm font-semibold text-primary line-clamp-2">
                {{ tag.name }}
              </h3>
              <p class="text-xs text-gray-500">
                {{ tag.post_count || 0 }} artikel
              </p>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty State -->
        <div
          v-if="tags.length === 0"
          class="text-center py-16 text-gray-500"
        >
          <p>Belum ada tag artikel tersedia.</p>
        </div>
      </div>
    </section>
  </div>
</template>

