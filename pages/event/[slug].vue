<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { Event } from '~/types/event'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useEvents } from '~/composables/useEvents'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useAdBanners } from '~/composables/useAdBanners'
import { formatEventType } from '~/utils/format'
import LayoutPageHeader from '~/components/layout/PageHeader.vue'
import IconMdiShareVariant from '~icons/mdi/share-variant'
import IconMdiContentCopy from '~icons/mdi/content-copy'
import IconMdiWhatsapp from '~icons/mdi/whatsapp'
import IconMdiInstagram from '~icons/mdi/instagram'
import IconMdiTag from '~icons/mdi/tag'
import IconSimpleIconsFacebook from '~icons/simple-icons/facebook'
import IconSimpleIconsX from '~icons/simple-icons/x'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { ref } from 'vue'
import { useSchemaOrg, defineEvent } from '#imports'
import { SEO_KEYWORDS } from '~/utils/seoKeywords'
import SeoFaqSection from '~/components/seo/SeoFaqSection.vue'
import SeoRelatedKeywords from '~/components/seo/SeoRelatedKeywords.vue'

const route = useRoute()
const config = useRuntimeConfig()
const slug = route.params.slug as string

// --- Fetch Event Data (Best Practice: await useAsyncData) ---
const { fetchEventBySlug } = useEvents()
const { getImage } = useSiteSettings()
const { fetchResponsiveBanners } = useAdBanners()

// --- Header Background from Site Settings ---
const headerBg = computed(() => getImage('header_bg_events', null) ?? undefined)

const { data: eventDetailBanners } = await useAsyncData(
  `ad-banners-event-detail-${slug}`,
  () => fetchResponsiveBanners('page_header_event_detail')
)
const headerAdBanners = computed(() => eventDetailBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => eventDetailBanners.value?.mobile ?? [])

const { data: event, error: fetchError } = await useAsyncData<Event>(
  `event-${slug}`,
  async () => {
    try {
      const res = await fetchEventBySlug(slug)
      if (!res?.data) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Event tidak ditemukan',
          fatal: true,
        })
      }
      return res.data
    } catch (err) {
      const error = err as { statusCode?: number; message?: string }
      if (error?.statusCode === 404) {
        throw err
      }
      throw createError({
        statusCode: 404,
        statusMessage: 'Event tidak ditemukan',
        fatal: true,
      })
    }
  },
  { watch: [() => route.params.slug] }
)

// Handle 404 if event not found
if (fetchError.value || !event.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Event tidak ditemukan',
    fatal: true,
  })
}

// --- SEO INJECTION LOGIC ---
// Cari tahu apakah halaman ini adalah pillar event berdasarkan slug
const pillarKeyword = computed(() => {
  const currentSlug = `/event/${slug}`
  return Object.values(SEO_KEYWORDS).find(keyword => keyword.targetPage === currentSlug)
})

// --- Computed Event (Type-safe for template) ---
const eventData = computed<Event>(() => event.value as Event)

// --- Breadcrumb Items ---
const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { text: 'Jadwal Lari', link: '/event' },
  { text: eventData.value.title || 'Detail Event', link: null },
])

// --- SEO Meta Tags ---
if (event.value) {
  const evt = event.value as Event
  useSeoMetaDynamic({
    title: evt.seo_title || evt.title,
    description: evt.seo_description || evt.description?.substring(0, 160) || '',
    image: evt.poster_webp_url || evt.image || `${config.public.siteUrl}/og-default.webp`,
    url: `/event/${slug}`,
    type: 'article',
    publishedTime: evt.created_at,
  })

  // --- Event Schema.org Markup ---
  useSchemaOrg([
    defineEvent({
      name: evt.title,
      startDate: evt.event_date,
      endDate: evt.event_end_date || evt.event_date,
      description: evt.seo_description || evt.description,
      image: evt.poster_webp_url || evt.image,
      location: {
        '@type': 'Place',
        name: evt.location_name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: evt.city,
          addressRegion: evt.province || undefined,
          addressCountry: 'ID',
        },
      },
      organizer: evt.organizer_name
        ? { '@type': 'Organization', name: evt.organizer_name }
        : undefined,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      url: `${config.public.siteUrl}/event/${slug}`,

      // OPTIMASI: Tambahkan `offers` untuk menampilkan info harga/tiket
      offers:
        evt.registration_fees && Object.keys(evt.registration_fees).length > 0
          ? Object.entries(evt.registration_fees).map(([category, price]) => ({
              '@type': 'Offer',
              name: category,
              price: (typeof price === 'string' ? price.replace(/[^0-9]/g, '') : '0') || '0',
              priceCurrency: 'IDR',
              url: evt.registration_url || `${config.public.siteUrl}/event/${slug}`,
              availability: 'https://schema.org/InStock',
              validFrom: evt.created_at,
            }))
          : undefined,
    }),
  ])
}

// --- Helper Functions (Exposed to template) ---
const _formatEventDate = (startDate?: string | null, endDate?: string | null): string => {
  if (!startDate) return ''
  const start = new Date(startDate)
  if (endDate) {
    const end = new Date(endDate)
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear())
      return `${format(start, 'd')} - ${format(end, 'd MMMM yyyy', { locale: id })}`

    return `${format(start, 'd MMM yyyy', { locale: id })} - ${format(end, 'd MMM yyyy', { locale: id })}`
  }
  return format(start, 'd MMMM yyyy', { locale: id })
}

const getContactValue = (contact: string | string[] | undefined): string => {
  if (!contact) return ''
  if (Array.isArray(contact)) return contact[0] || ''
  return contact
}

// --- Combine Event Type + Categories ---
const getCombinedEventMeta = (): string => {
  const typeLabel = formatEventType(eventData.value.event_type)

  const categorySources = eventData.value.categories ?? []
  const categoryLabels = (Array.isArray(categorySources) ? categorySources : [])
    .map(category => (typeof category === 'string' ? category : category?.name))
    .filter(Boolean) as string[]

  const allLabels = [typeLabel, ...categoryLabels].filter(Boolean)
  return allLabels.join(', ')
}

// --- Share Functionality ---
const shareUrl = computed(() => `${config.public.siteUrl}/event/${slug}`)
const shareText = computed(() => `${eventData.value.title} - ${eventData.value.location_name}`)
const showSharePopover = ref(false)
const copyLinkSuccess = ref(false)

const copyLink = async () => {
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
  const url = `https://wa.me/?text=${encodeURIComponent(`${shareText.value} ${shareUrl.value}`)}`
  window.open(url, '_blank', 'noopener,noreferrer')
  showSharePopover.value = false
}

const shareInstagram = () => {
  copyLink()
}

const shareFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank', 'noopener,noreferrer')
  showSharePopover.value = false
}

const shareX = () => {
  const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareText.value)}`
  window.open(url, '_blank', 'noopener,noreferrer')
  showSharePopover.value = false
}

// --- Deduplicate Contact & Social ---
const allContactItems = computed(() => {
  const items = new Map<string, { label: string; value: string; type: string }>()

  // From contact_info
  if (eventData.value.contact_info) {
    Object.entries(eventData.value.contact_info).forEach(([method, contact]) => {
      const value = getContactValue(contact)
      if (value) {
        const key = `${method}-${value}`.toLowerCase()
        items.set(key, { label: method, value, type: 'contact' })
      }
    })
  }

  // From social_media (avoid duplicates)
  if (eventData.value.social_media) {
    Object.entries(eventData.value.social_media).forEach(([platform, handle]) => {
      const value = getContactValue(handle)
      if (value && !Array.from(items.values()).some(item => item.value === value)) {
        const key = `${platform}-${value}`.toLowerCase()
        items.set(key, { label: platform, value, type: 'social' })
      }
    })
  }

  return Array.from(items.values())
})
</script>

<template>
  <div
    v-if="eventData"
    class="bg-surface min-h-screen"
  >
    <!-- Page Header -->
    <LayoutPageHeader
      :title="eventData.title"
      :description="`${eventData.location_name}, ${eventData.city}`"
      :breadcrumbs="breadcrumbItems"
      :background-image-url="headerBg"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <!-- Main Content -->
    <div class="layout-container py-10">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Main Content Area -->
        <div class="lg:col-span-2">
          <!-- Tentang Event Section (ALL IN ONE) -->
          <div class="rounded-2xl border border-secondary bg-white p-6 space-y-4">
            <!-- Top Row: Badge + Share Icon (Space Between) -->
            <div class="flex items-center justify-between gap-4">
              <!-- Event Type + Categories Badges (Combined) -->
              <div class="flex-1 min-w-0">
                <span
                  class="badge-modern inline-flex items-center gap-2 max-w-full truncate"
                  :title="getCombinedEventMeta()"
                >
                  <IconMdiTag class="h-4 w-4 flex-shrink-0" />
                  <span class="truncate">{{ getCombinedEventMeta() }}</span>
                </span>
              </div>

              <!-- Share Icon Button -->
              <Popover
                v-model="showSharePopover"
                class="relative"
              >
                <PopoverButton
                  class="p-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-primary transition-colors flex-shrink-0"
                  title="Bagikan Event"
                >
                  <IconMdiShareVariant class="h-5 w-5 text-secondary" />
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
                      <IconSimpleIconsFacebook class="h-4 w-4 text-[#1877F2] flex-shrink-0" />
                      Facebook
                    </button>
                    <button
                      class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors text-left text-sm"
                      @click="shareX"
                    >
                      <IconSimpleIconsX class="h-4 w-4 text-gray-600 flex-shrink-0" />
                      X
                    </button>
                  </div>
                </PopoverPanel>
              </Popover>
            </div>

            <!-- Tentang Event Title -->
            <h2 class="lg:text-lg text-base font-bold text-primary">
              Tentang Event
            </h2>

            <!-- Description -->
            <p class="lg:text-base text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {{ eventData.description }}
            </p>

            <!-- Divider -->
            <div class="border-t border-secondary/20" />

            <!-- Biaya Registrasi -->
            <div
              v-if="
                eventData.registration_fees && Object.keys(eventData.registration_fees).length > 0
              "
            >
              <h3 class="lg:text-lg text-base font-bold text-primary mb-4">
                Biaya Registrasi
              </h3>
              <div class="space-y-3">
                <div
                  v-for="(fee, category) in eventData.registration_fees"
                  :key="category"
                  class="flex justify-between items-center p-4 rounded-xl border border-secondary bg-white hover:border-secondary/70 transition-colors"
                >
                  <span class="text-sm font-medium text-gray-600">{{ category }}</span>
                  <span class="text-sm font-bold text-primary">{{ fee }}</span>
                </div>
              </div>
            </div>

            <!-- Benefit Peserta -->
            <div v-if="eventData.benefits && eventData.benefits.length > 0">
              <h3 class="lg:text-lg text-base font-bold text-primary mb-4">
                Benefit Peserta
              </h3>
              <ul class="space-y-3">
                <li
                  v-for="(benefit, idx) in eventData.benefits"
                  :key="idx"
                  class="flex items-start gap-3 p-4 rounded-xl border border-secondary bg-white hover:border-secondary/70 transition-colors"
                >
                  <span
                    class="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-white"
                  >✓</span>
                  <span class="text-sm text-gray-600">{{ benefit }}</span>
                </li>
              </ul>
            </div>

            <!-- Kontak & Sosial -->
            <div v-if="allContactItems.length > 0">
              <h3 class="lg:text-lg text-base font-bold text-primary mb-4">
                Kontak & Sosial
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  v-for="(item, idx) in allContactItems"
                  :key="idx"
                  class="flex items-center gap-3 p-4 rounded-xl border border-secondary bg-white hover:border-secondary/70 transition-colors"
                >
                  <!-- WhatsApp -->
                  <a
                    v-if="item.label.toLowerCase().includes('whatsapp')"
                    :href="`https://wa.me/${item.value.replace(/\D/g, '')}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 text-gray-600 hover:text-secondary font-medium text-sm w-full"
                  >
                    <IconMdiWhatsapp class="h-5 w-5 text-[#25D366] flex-shrink-0" />
                    {{ item.value }}
                  </a>
                  <!-- Email -->
                  <a
                    v-else-if="item.label.toLowerCase().includes('email')"
                    :href="`mailto:${item.value}`"
                    class="flex items-center gap-3 text-gray-600 hover:text-secondary font-medium text-sm w-full"
                  >
                    <IconMdiEmail class="h-5 w-5 text-gray-600 flex-shrink-0" />
                    {{ item.value }}
                  </a>
                  <!-- Instagram -->
                  <a
                    v-else-if="item.label.toLowerCase().includes('instagram')"
                    :href="`https://instagram.com/${item.value.replace('@', '')}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 text-gray-600 hover:text-secondary font-medium text-sm w-full"
                  >
                    <IconMdiInstagram class="h-5 w-5 text-[#E1306C] flex-shrink-0" />
                    @{{ item.value.replace('@', '') }}
                  </a>
                  <!-- Other/Phone -->
                  <div
                    v-else
                    class="flex items-center gap-3 text-gray-600 font-medium text-sm w-full"
                  >
                    <IconMdiPhone class="h-5 w-5 text-gray-600 flex-shrink-0" />
                    {{ item.value }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-6">
            <!-- Event Thumbnail (Full Width, No Padding) -->
            <div
              v-if="eventData.poster_webp_url || eventData.image"
              class="rounded-2xl overflow-hidden border border-secondary"
            >
              <NuxtImg
                :src="eventData.poster_webp_url || eventData.image || undefined"
                :alt="eventData.title"
                class="w-full h-auto object-cover"
                format="webp"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>

            <!-- Registration CTA -->
            <div
              v-if="eventData.registration_url"
              class="rounded-2xl border border-secondary bg-white p-6 text-center"
            >
              <h3 class="lg:text-lg text-base font-bold text-primary mb-4">
                Daftar Sekarang
              </h3>
              <UiAppButton
                block
                variant="secondary"
                size="lg"
                as="a"
                :href="eventData.registration_url"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buka Pendaftaran
              </UiAppButton>
              <p class="text-xs text-gray-500 mt-3">
                Akan membuka di tab baru
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SEO Injection Sections -->
    <div
      v-if="pillarKeyword"
      class="space-y-10 lg:space-y-16 bg-surface py-10"
    >
      <SeoFaqSection :keyword="pillarKeyword" />
      <SeoRelatedKeywords :keyword="pillarKeyword" />
    </div>
  </div>
</template>
