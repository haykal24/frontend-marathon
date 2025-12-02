<script setup lang="ts">
/**
 * Halaman Detail Komunitas Lari
 * URL: /ekosistem/komunitas-lari/{slug}
 */

import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { RunningCommunity } from '~/types/ecosystem'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useEcosystem } from '~/composables/useEcosystem'
import { useAdBanners } from '~/composables/useAdBanners'
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema'
import { useSchemaOrg, defineWebPage, defineOrganization } from '#imports'
import LayoutPageHeader from '~/components/layout/PageHeader.vue'
import IconMdiInstagram from '~icons/mdi/instagram'
import IconMdiWhatsapp from '~icons/mdi/whatsapp'
import IconMdiEmailOutline from '~icons/mdi/email-outline'
import IconMdiPhone from '~icons/mdi/phone'
import IconMdiMapMarker from '~icons/mdi/map-marker'
import IconMdiClose from '~icons/mdi/close'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconHeroiconsArrowLeft20Solid from '~icons/heroicons/arrow-left-20-solid'
import { buildWhatsappUrl } from '~/utils/contact'

const route = useRoute()
const config = useRuntimeConfig()
const slug = route.params.slug as string

const { getRunningCommunityBySlug } = useEcosystem()
const { getImage } = useSiteSettings()
const { fetchResponsiveBanners } = useAdBanners()

// Fetch community data with proper error handling
const { data: communityResponse, error: fetchError } = await useAsyncData<{ data: RunningCommunity }>(
  `community-${slug}`,
  async () => {
    try {
      const res = await getRunningCommunityBySlug(slug)
      if (!res?.data) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Komunitas tidak ditemukan',
          fatal: true,
        })
      }
      return res
    } catch (err: any) {
      // Handle API errors (404, 500, etc.)
      // $fetch from ofetch will throw FetchError for non-2xx responses
      const statusCode = err?.statusCode || err?.status || err?.response?.status || 404
      
      if (statusCode === 404) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Komunitas tidak ditemukan',
          fatal: true,
        })
      }
      
      // For other errors, also throw 404 to prevent showing listing page
      throw createError({
        statusCode: 404,
        statusMessage: 'Komunitas tidak ditemukan',
        fatal: true,
      })
    }
  },
  { watch: [() => route.params.slug] }
)

const community = computed(() => {
  const data = communityResponse.value?.data
  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Komunitas tidak ditemukan',
      fatal: true,
    })
  }
  return data
})

// Handle 404 if community not found
if (fetchError.value || !community.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Komunitas tidak ditemukan',
    fatal: true,
  })
}

// SEO
const seoTitle = computed(() => `${community.value.name} - Komunitas Lari Indonesia`)
const seoDescription = computed(() => 
  `Bergabung dengan ${community.value.name}${community.value.city ? ` di ${community.value.city}` : ''}. ${community.value.location ? `Lokasi: ${community.value.location}. ` : ''}Temukan jadwal latihan dan event komunitas lari terdekat.`
)

useSeoMetaDynamic({
  title: seoTitle.value,
  description: seoDescription.value,
  url: `/ekosistem/komunitas-lari/${slug}`,
  type: 'website',
})

// Schema.org
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/ekosistem/komunitas-lari/${slug}`,
    name: seoTitle.value,
    description: seoDescription.value,
  }),
  defineOrganization({
    name: community.value.name,
    description: seoDescription.value,
    url: community.value.instagram_handle 
      ? `https://instagram.com/${community.value.instagram_handle.replace('@', '')}`
      : undefined,
    address: community.value.location ? {
      '@type': 'PostalAddress',
      addressLocality: community.value.city || community.value.location,
      addressCountry: 'ID',
    } : undefined,
  }),
])

// Breadcrumbs
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Ekosistem', link: '/ekosistem' },
  { text: 'Komunitas Lari', link: '/ekosistem/komunitas-lari' },
  { text: community.value.name, link: null },
])

useBreadcrumbSchema(breadcrumbs)

// Header
const headerBg = computed(() => getImage('header_bg_komunitas', null) ?? undefined)

const { data: communityHeaderBanners } = await useAsyncData(
  `ad-banners-community-detail-${slug}`,
  () => fetchResponsiveBanners('page_header_ekosistem')
)
const headerAdBanners = computed(() => communityHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => communityHeaderBanners.value?.mobile ?? [])

// Image helpers
const $img = useImage()
const buildImageUrl = (src?: string | null, modifiers: Record<string, number | string> = {}) => {
  if (!src) return null
  return $img(src, {
    format: 'webp',
    quality: 80,
    ...modifiers,
  })
}

const logoImage = computed(() => buildImageUrl(community.value.logo_url, { width: 400, height: 400 }))
const galleryImages = computed(() => 
  (community.value.gallery || []).map(img => ({
    ...img,
    // URL original untuk lightbox (full size tanpa resize dari backend)
    full_url: img.original_url || img.url, // Gunakan original_url dari backend, fallback ke url
    // Optimized untuk thumbnail
    thumb_optimized_url: buildImageUrl(img.thumb_url, { width: 400, height: 300 }),
  }))
)

// Contact helpers
const instagramUrl = computed(() => {
  if (!community.value.instagram_handle) return null
  const handle = community.value.instagram_handle.replace('@', '')
  return `https://instagram.com/${handle}`
})

const whatsappUrl = computed(() => {
  if (!community.value.phone) return null
  return buildWhatsappUrl(community.value.phone)
})

const emailUrl = computed(() => {
  if (!community.value.email) return null
  return `mailto:${community.value.email}`
})

// Gallery Lightbox State
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

// Gallery click handler - Open lightbox
const handleGalleryClick = (index: number) => {
  lightboxIndex.value = index
  lightboxOpen.value = true
  // Prevent body scroll when lightbox is open
  if (import.meta.client && typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }
}

// Close lightbox
const closeLightbox = () => {
  lightboxOpen.value = false
  if (import.meta.client && typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
}

// Navigate lightbox
const nextImage = () => {
  if (lightboxIndex.value < galleryImages.value.length - 1) {
    lightboxIndex.value++
  } else {
    lightboxIndex.value = 0
  }
}

const prevImage = () => {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--
  } else {
    lightboxIndex.value = galleryImages.value.length - 1
  }
}

// Keyboard navigation
onMounted(() => {
  if (import.meta.client) {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!lightboxOpen.value) return
      
      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowRight') {
        nextImage()
      } else if (e.key === 'ArrowLeft') {
        prevImage()
      }
    }
    
    window.addEventListener('keydown', handleKeydown)
    
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
    })
  }
})
</script>

<template>
  <div class="bg-surface min-h-screen">
    <!-- Page Header -->
    <LayoutPageHeader
      :title="community.name"
      :description="`Komunitas lari${community.city ? ` di ${community.city}` : ''}${community.location ? ` - ${community.location}` : ''}`"
      :breadcrumbs="breadcrumbs"
      :background-image-url="headerBg"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <!-- Main Content -->
    <section class="bg-surface py-10">
      <div class="layout-container">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- About Section -->
            <div class="rounded-2xl border border-secondary bg-white p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="badge-modern">Komunitas Lari</span>
              </div>

              <h2 class="text-xl font-bold text-primary mb-4">
                Tentang Komunitas
              </h2>

              <!-- Description -->
              <div
                v-if="community.description"
                class="mb-6 text-sm lg:text-base text-gray-700 leading-relaxed"
              >
                <p>{{ community.description }}</p>
              </div>

              <!-- Location -->
              <div
                v-if="community.location || community.city"
                class="mb-4 flex items-center gap-2 text-gray-600"
              >
                <IconMdiMapMarker class="h-5 w-5 text-secondary flex-shrink-0" />
                <span>{{ community.city || community.location }}</span>
                <span v-if="community.city && community.location"> - {{ community.location }}</span>
              </div>

              <!-- Contact Info -->
              <div class="flex flex-wrap gap-3">
                <a
                  v-if="instagramUrl"
                  :href="instagramUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20 transition"
                >
                  <IconMdiInstagram class="h-5 w-5" />
                  <span class="text-sm font-medium">{{ community.instagram_handle }}</span>
                </a>

                <a
                  v-if="whatsappUrl"
                  :href="whatsappUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition"
                >
                  <IconMdiWhatsapp class="h-5 w-5" />
                  <span class="text-sm font-medium">WhatsApp</span>
                </a>

                <a
                  v-if="emailUrl"
                  :href="emailUrl"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  <IconMdiEmailOutline class="h-5 w-5" />
                  <span class="text-sm font-medium">{{ community.email }}</span>
                </a>

                <div
                  v-if="community.phone && !whatsappUrl"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
                >
                  <IconMdiPhone class="h-5 w-5" />
                  <span class="text-sm font-medium">{{ community.phone }}</span>
                </div>
              </div>

           
            </div>

            <!-- Gallery Section -->
            <div
              v-if="galleryImages.length > 0"
              class="rounded-2xl border border-secondary bg-white p-6"
            >
              <h2 class="text-xl font-bold text-primary mb-4">
                Galeri
              </h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  v-for="(img, idx) in galleryImages"
                  :key="img.id || idx"
                  class="relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition"
                  @click="handleGalleryClick(idx)"
                >
                  <img
                    :src="img.thumb_optimized_url || img.thumb_url"
                    :alt="img.name || `Galeri ${community.name} ${idx + 1}`"
                    class="w-full h-full object-contain"
                    loading="lazy"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="sticky top-24 space-y-6">
              <!-- Logo Card -->
              <div
                v-if="logoImage"
                class="rounded-2xl border border-secondary bg-white p-6 text-center"
              >
                <img
                  :src="logoImage"
                  :alt="community.name"
                  class="w-full max-w-[200px] mx-auto rounded-xl object-cover mb-4"
                  width="200"
                  height="200"
                  loading="eager"
                >
                <h3 class="text-lg font-bold text-primary">
                  {{ community.name }}
                </h3>
              </div>

              <!-- Quick Links -->
              <div class="rounded-2xl border border-secondary bg-white p-6">
                <h3 class="text-lg font-bold text-primary mb-4">
                  Tautan Cepat
                </h3>
                <div class="space-y-3">
                  <NuxtLink
                    to="/ekosistem/komunitas-lari"
                    class="flex items-center gap-2 text-sm text-gray-600 hover:text-secondary transition"
                  >
                    <IconHeroiconsArrowRight20Solid class="h-4 w-4" />
                    Lihat Semua Komunitas
                  </NuxtLink>
                  <NuxtLink
                    to="/ekosistem"
                    class="flex items-center gap-2 text-sm text-gray-600 hover:text-secondary transition"
                  >
                    <IconHeroiconsArrowRight20Solid class="h-4 w-4" />
                    Kembali ke Ekosistem
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Gallery Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen && galleryImages.length > 0"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        @click="closeLightbox"
      >
        <!-- Close Button -->
        <button
          class="absolute top-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          @click.stop="closeLightbox"
        >
          <IconMdiClose class="h-6 w-6" />
        </button>

        <!-- Navigation Buttons -->
        <button
          v-if="galleryImages.length > 1"
          class="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          @click.stop="prevImage"
        >
          <IconHeroiconsArrowLeft20Solid class="h-6 w-6" />
        </button>

        <button
          v-if="galleryImages.length > 1"
          class="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          @click.stop="nextImage"
        >
          <IconHeroiconsArrowRight20Solid class="h-6 w-6" />
        </button>

        <!-- Image Container -->
        <div
          class="relative max-h-[90vh] max-w-[90vw]"
          @click.stop
        >
          <img
            :src="galleryImages[lightboxIndex]?.full_url || galleryImages[lightboxIndex]?.url"
            :alt="galleryImages[lightboxIndex]?.name || `Galeri ${community.name} ${lightboxIndex + 1}`"
            class="max-h-[90vh] max-w-[90vw] object-contain"
            loading="eager"
          >
        </div>

        <!-- Image Counter -->
        <div
          v-if="galleryImages.length > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm"
        >
          {{ lightboxIndex + 1 }} / {{ galleryImages.length }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

