<script setup lang="ts">
/**
 * Halaman INDEX Kategori Blog - Listing semua kategori blog
 * 
 * URL: /blog/kategori
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
import type { BlogCategory } from '~/types/blog'
import IconHeroiconsTag20Solid from '~icons/heroicons/tag-20-solid'

const config = useRuntimeConfig()
const { getImage } = useSiteSettings()
const { fetchBlogCategories } = useBlogPosts()
const { fetchResponsiveBanners } = useAdBanners()

// Fetch categories
const { data: categoriesData } = await useAsyncData('blog-categories-all', () => fetchBlogCategories())
const categories = computed<BlogCategory[]>(() => categoriesData.value?.data ?? [])

// SEO
const currentYear = new Date().getFullYear()
const seoTitle = `Kategori Blog Lari ${currentYear} - Artikel Berdasarkan Topik`
const seoDescription = `Jelajahi ${categories.value.length}+ kategori artikel lari di Indonesia. Temukan artikel berdasarkan kategori favoritmu: panduan latihan, tips gear, review event, dan kesehatan.`

useSeoMetaDynamic({
  title: seoTitle,
  description: seoDescription,
  url: '/blog/kategori',
  type: 'website',
})

// Schema.org
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/blog/kategori`,
    name: seoTitle,
    description: seoDescription,
    '@type': 'CollectionPage',
  }),
])

// Breadcrumbs (Home otomatis ditambahkan oleh komponen Breadcrumb)
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Blog', link: '/blog' },
  { text: 'Kategori', link: '/blog/kategori' },
])

useBreadcrumbSchema(breadcrumbs)

// Header
const headerBg = computed(() => getImage('header_bg_blog', null) ?? undefined)
const { data: blogHeaderBanners } = await useAsyncData('ad-banners-blog-header-kategori', () =>
  fetchResponsiveBanners('page_header_blog')
)
const headerAdBanners = computed(() => blogHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => blogHeaderBanners.value?.mobile ?? [])
</script>

<template>
  <div>
    <!-- Page Header -->
    <LayoutPageHeader
      title="Kategori Blog Lari"
      :description="`Jelajahi ${categories.length} kategori artikel lari di Indonesia`"
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
            Pilih Kategori untuk Melihat Artikel
          </h2>
          <p class="text-gray-600">
            Temukan artikel blog berdasarkan kategori favoritmu. Filter artikel berdasarkan topik yang paling relevan.
          </p>
        </div>

        <!-- Categories Grid (Styling seperti EventTypeSection) -->
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/blog/kategori/${category.slug}`"
            class="group relative rounded-2xl border border-secondary/30 bg-white p-4 text-center transition hover:border-secondary hover:bg-surface/80"
          >
            <div class="flex flex-col items-center gap-2">
              <span
                class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20 text-primary transition group-hover:bg-secondary/30"
              >
                <IconHeroiconsTag20Solid class="h-6 w-6" />
              </span>
              <h3 class="text-sm font-semibold text-primary line-clamp-2">
                {{ category.name }}
              </h3>
              <p
                v-if="category.description"
                class="text-xs text-gray-500 line-clamp-2"
              >
                {{ category.description }}
              </p>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty State -->
        <div
          v-if="categories.length === 0"
          class="text-center py-16 text-gray-500"
        >
          <p>Belum ada kategori artikel tersedia.</p>
        </div>
      </div>
    </section>
  </div>
</template>

