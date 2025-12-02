<script setup lang="ts">
/**
 * Halaman Detail Vendor (Generic untuk semua jenis vendor)
 * URL: /ekosistem/vendor/{slug}
 */

import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { Vendor } from '~/types/ecosystem'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useEcosystem } from '~/composables/useEcosystem'
import { useAdBanners } from '~/composables/useAdBanners'
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema'
import { useSchemaOrg, defineWebPage, defineOrganization } from '#imports'
import LayoutPageHeader from '~/components/layout/PageHeader.vue'
import IconMdiWeb from '~icons/mdi/web'
import IconMdiEmailOutline from '~icons/mdi/email-outline'
import IconMdiWhatsapp from '~icons/mdi/whatsapp'
import IconMdiPhone from '~icons/mdi/phone'
import IconMdiMapMarker from '~icons/mdi/map-marker'
import IconMdiClose from '~icons/mdi/close'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconHeroiconsArrowLeft20Solid from '~icons/heroicons/arrow-left-20-solid'
import { buildWhatsappUrl, formatWebsiteDisplay } from '~/utils/contact'

const route = useRoute()
const config = useRuntimeConfig()
const slug = route.params.slug as string

const { getVendorBySlug } = useEcosystem()
const { getImage } = useSiteSettings()
const { fetchResponsiveBanners } = useAdBanners()

// Fetch vendor data
const { data: vendorResponse, error: fetchError } = await useAsyncData<{ data: Vendor }>(
  `vendor-${slug}`,
  async () => {
    return await getVendorBySlug(slug)
  },
  { watch: [() => route.params.slug] }
)

const vendor = computed(() => {
  const data = vendorResponse.value?.data
  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Vendor tidak ditemukan',
      fatal: true,
    })
  }
  return data
})

if (fetchError.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Vendor tidak ditemukan',
    fatal: true,
  })
}

// Get vendor type label
const vendorTypeLabel = computed(() => {
  const typeMap: Record<string, string> = {
    medali: 'Vendor Medali',
    race_management: 'Race Management',
    jersey: 'Vendor Jersey',
    fotografer: 'Fotografer Lari',
  }
  return typeMap[vendor.value.type_raw || vendor.value.type] || vendor.value.type
})

// Get category link based on type
const categoryLink = computed(() => {
  const typeMap: Record<string, string> = {
    medali: '/ekosistem/vendor-medali',
    race_management: '/ekosistem/race-management',
    jersey: '/ekosistem/vendor-jersey',
    fotografer: '/ekosistem/vendor-fotografer',
  }
  return typeMap[vendor.value.type_raw || vendor.value.type] || '/ekosistem'
})

// SEO
const seoTitle = computed(() => `${vendor.value.name} - ${vendorTypeLabel.value} Indonesia`)
const seoDescription = computed(() => 
  `${vendor.value.name} adalah ${vendorTypeLabel.value.toLowerCase()}${vendor.value.city ? ` di ${vendor.value.city}` : ''}. ${vendor.value.description || 'Temukan vendor terpercaya untuk kebutuhan event lari Anda.'}`
)

useSeoMetaDynamic({
  title: seoTitle.value,
  description: seoDescription.value,
  url: `/ekosistem/vendor/${slug}`,
  type: 'website',
})

// Schema.org
useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/ekosistem/vendor/${slug}`,
    name: seoTitle.value,
    description: seoDescription.value,
  }),
  defineOrganization({
    name: vendor.value.name,
    description: seoDescription.value,
    url: vendor.value.website || undefined,
    address: vendor.value.city ? {
      '@type': 'PostalAddress',
      addressLocality: vendor.value.city,
      addressCountry: 'ID',
    } : undefined,
  }),
])

// Breadcrumbs
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { text: 'Ekosistem', link: '/ekosistem' },
  { text: vendorTypeLabel.value, link: categoryLink.value },
  { text: vendor.value.name, link: null },
])

useBreadcrumbSchema(breadcrumbs)

// Header
const headerBg = computed(() => getImage('header_bg_ekosistem', null) ?? undefined)

const { data: vendorHeaderBanners } = await useAsyncData(
  `ad-banners-vendor-detail-${slug}`,
  () => fetchResponsiveBanners('page_header_ekosistem')
)
const headerAdBanners = computed(() => vendorHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => vendorHeaderBanners.value?.mobile ?? [])

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

const logoImage = computed(() => {
  const logo = vendor.value.logo || vendor.value.logo_url
  return buildImageUrl(logo, { width: 400, height: 400 })
})

const galleryImages = computed(() => 
  (vendor.value.gallery || []).map(img => ({
    ...img,
    optimized_url: buildImageUrl(img.url, { width: 1200, height: 800 }),
    thumb_optimized_url: buildImageUrl(img.thumb_url, { width: 400, height: 300 }),
  }))
)

// Contact helpers
const whatsappUrl = computed(() => {
  if (!vendor.value.phone) return null
  return buildWhatsappUrl(vendor.value.phone)
})

const emailUrl = computed(() => {
  if (!vendor.value.email) return null
  return `mailto:${vendor.value.email}`
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
      :title="vendor.name"
      :description="`${vendorTypeLabel}${vendor.city ? ` di ${vendor.city}` : ''}`"
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
                <span class="badge-modern">{{ vendorTypeLabel }}</span>
              </div>

              <h2 class="text-xl font-bold text-primary mb-4">
                Tentang Vendor
              </h2>

              <!-- Description -->
              <div
                v-if="vendor.description"
                class="mb-6 text-sm lg:text-base text-gray-700 leading-relaxed"
              >
                <p>{{ vendor.description }}</p>
              </div>

              <!-- Location -->
              <div
                v-if="vendor.city"
                class="mb-4 flex items-center gap-2 text-gray-600"
              >
                <IconMdiMapMarker class="h-5 w-5 text-secondary flex-shrink-0" />
                <span>{{ vendor.city }}</span>
              </div>

              <!-- Contact Info -->
              <div class="flex flex-wrap gap-3">
                <a
                  v-if="vendor.website"
                  :href="vendor.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] hover:bg-[#0EA5E9]/20 transition"
                >
                  <IconMdiWeb class="h-5 w-5" />
                  <span class="text-sm font-medium">{{ formatWebsiteDisplay(vendor.website) }}</span>
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
                  <span class="text-sm font-medium">{{ vendor.email }}</span>
                </a>

                <div
                  v-if="vendor.phone && !whatsappUrl"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
                >
                  <IconMdiPhone class="h-5 w-5" />
                  <span class="text-sm font-medium">{{ vendor.phone }}</span>
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
                  class="relative aspect-video rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition"
                  @click="handleGalleryClick(idx)"
                >
                  <img
                    :src="img.thumb_optimized_url || img.thumb_url"
                    :alt="img.name || `Galeri ${vendor.name} ${idx + 1}`"
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
                  :alt="vendor.name"
                  class="w-full max-w-[200px] mx-auto rounded-xl object-cover mb-4"
                  width="200"
                  height="200"
                  loading="eager"
                >
                <h3 class="text-lg font-bold text-primary mb-2">
                  {{ vendor.name }}
                </h3>
                <span class="text-sm text-gray-600">{{ vendorTypeLabel }}</span>
              </div>

              <!-- Quick Links -->
              <div class="rounded-2xl border border-secondary bg-white p-6">
                <h3 class="text-lg font-bold text-primary mb-4">
                  Tautan Cepat
                </h3>
                <div class="space-y-3">
                  <NuxtLink
                    :to="categoryLink"
                    class="flex items-center gap-2 text-sm text-gray-600 hover:text-secondary transition"
                  >
                    <IconHeroiconsArrowRight20Solid class="h-4 w-4" />
                    Lihat Semua {{ vendorTypeLabel }}
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
            :src="galleryImages[lightboxIndex]?.optimized_url || galleryImages[lightboxIndex]?.url"
            :alt="galleryImages[lightboxIndex]?.name || `Galeri ${vendor.name} ${lightboxIndex + 1}`"
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

