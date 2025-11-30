<script setup lang="ts">
import { computed } from 'vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { Event } from '~/types/event'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useEvents } from '~/composables/useEvents'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useAdBanners } from '~/composables/useAdBanners'
import { useEventFaq } from '~/composables/useEventFaq'
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
import { useEventSchema } from '~/composables/useEventSchema'
import { useBreadcrumbSchema } from '~/composables/useBreadcrumbSchema'
import IconMdiChevronDown from '~icons/mdi/chevron-down'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconMdiEmail from '~icons/mdi/email'
import IconMdiPhone from '~icons/mdi/phone'
import IconHeroiconsMapPin20Solid from '~icons/heroicons/map-pin-20-solid'
import IconHeroiconsTag20Solid from '~icons/heroicons/tag-20-solid'
import IconHeroiconsBookOpen20Solid from '~icons/heroicons/book-open-20-solid'
import IconHeroiconsUserGroup20Solid from '~icons/heroicons/user-group-20-solid'

const route = useRoute()
const config = useRuntimeConfig()
const slug = route.params.slug as string

// --- Event FAQ State ---
const eventFaqExpandedIndex = ref<number | null>(0)

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

// --- Computed Event (Type-safe for template) ---
const eventData = computed<Event>(() => event.value as Event)
const $img = useImage()

const buildImageUrl = (
  src?: string | null,
  modifiers: Record<string, number | string> = {}
) => {
  if (!src) return null
  return $img(src, {
    format: 'webp',
    quality: 80,
    ...modifiers,
  })
}

const eventPosterImage = computed(() =>
  buildImageUrl(eventData.value?.poster_webp_url || eventData.value?.image, {
    width: 800,
    height: 1000,
  }),
)

// --- Breadcrumb Items (dengan hierarki Programmatic SEO) ---
// Breadcrumbs (Home otomatis ditambahkan oleh komponen Breadcrumb)
// Format: Event → Provinsi → Kota → [Nama Event]
// Fallback: Event → Kategori → [Nama Kategori] → [Nama Event] (jika provinsi tidak ada)
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [
    { text: 'Event', link: '/event' },
  ]

  // Prioritas 1: Provinsi (UTAMA)
  if (eventData.value.province) {
    items.push({ text: 'Provinsi', link: '/event/provinsi' })
    const provinceSlug = eventData.value.province.toLowerCase().replace(/\s+/g, '-')
    items.push({
      text: eventData.value.province,
      link: `/event/provinsi/${provinceSlug}`,
    })

    // Tambahkan Kota jika ada
    if (eventData.value.city && eventData.value.city.trim() !== '') {
      const citySlug = eventData.value.city.toLowerCase().replace(/\s+/g, '-')
      items.push({
        text: eventData.value.city,
        link: `/event/kota/${citySlug}`,
      })
    }
  } 
  // Fallback: Kategori (jika provinsi tidak ada)
  else if (eventData.value.event_type) {
    items.push({ text: 'Kategori', link: '/event/kategori' })
    items.push({
      text: formatEventType(eventData.value.event_type),
      link: `/event/kategori/${eventData.value.event_type}`,
    })
  }

  // Event name (current page)
  items.push({ text: eventData.value.title || 'Detail Event', link: null })

  return items
})

// SEO: BreadcrumbList Schema.org untuk rich results
useBreadcrumbSchema(breadcrumbs)

// --- SEO Meta Tags ---
if (event.value) {
  const evt = event.value as Event
  
  // SEO: Meta tags dinamis untuk halaman event
  useSeoMetaDynamic({
    title: evt.seo_title || evt.title,
    description: evt.seo_description || evt.description?.substring(0, 160) || '',
    url: `/event/${slug}`,
    type: 'article',
    publishedTime: evt.created_at,
  })

  // SEO: Override OG Image dengan poster event (fallback ke og.webp jika tidak ada)
  const ogImageUrl = evt.poster_webp_url || evt.image
  if (ogImageUrl) {
    defineOgImage({
      url: ogImageUrl,
      alt: `${evt.title} - ${evt.location_name}`,
      width: 1200,
      height: 630,
    })
  }
  // Jika tidak ada poster, akan otomatis menggunakan og.webp dari config
}

  // --- Event-Specific FAQ Generation ---
const { generateFaq } = useEventFaq()
  const eventFaqItems = computed(() => {
    if (!event.value) return []
    return generateFaq(event.value)
  })

  // --- Event Schema.org Markup ---
if (event.value) {
  const evt = event.value as Event
  
  // Menggunakan composable useEventSchema yang sudah dioptimalkan (Local SEO, Default Values)
  useEventSchema({
    name: evt.title,
    description: evt.seo_description || evt.description || '',
    startDate: evt.event_date,
    endDate: evt.event_end_date || evt.event_date,
    url: `${config.public.siteUrl}/event/${slug}`,
    image: evt.poster_webp_url || evt.image || `${config.public.siteUrl}/og.webp`,
    
    location: {
      name: evt.location_name,
      address: {
        addressLocality: evt.city,
        addressRegion: evt.province || undefined, // Penting untuk Local SEO
        addressCountry: 'ID',
        streetAddress: evt.location_name, // Gunakan nama lokasi sebagai fallback jalan jika tidak ada field khusus
      }
    },

    organizer: {
      name: evt.organizer_name || 'Indonesian Marathon Community',
      url: undefined // Bisa diisi jika ada data website organizer
    },

    performer: {
      name: evt.organizer_name || 'Indonesian Marathon Community'
    },

    // Mapping offers (tiket)
    offers: evt.registration_fees && Object.keys(evt.registration_fees).length > 0
      ? Object.entries(evt.registration_fees).map(([_category, price]) => ({
          price: (typeof price === 'string' ? price.replace(/[^0-9]/g, '') : '0') || '0',
          priceCurrency: 'IDR',
          availability: 'InStock', // Default
          url: evt.registration_url || `${config.public.siteUrl}/event/${slug}`,
          validFrom: evt.created_at,
        }))
      : undefined
  })
}

// --- Helper Functions (Exposed to template) ---
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

const normalizePhoneNumber = (value: string): string => {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('8')) return `62${digits}`
  return digits
}

const leadGeneratorMessage = computed(() => {
  const baseUrl = `${config.public.siteUrl}/event/${slug}`
  const title = eventData.value?.title ?? 'event lari'
  return `Halo, saya mendapatkan info ${title} melalui ${baseUrl}`
})

const buildWhatsappUrl = (value: string): string | null => {
  const normalized = normalizePhoneNumber(value)
  if (!normalized) return null
  return `https://wa.me/${normalized}?text=${encodeURIComponent(leadGeneratorMessage.value)}`
}

const buildTelUrl = (value: string): string | null => {
  if (!value) return null
  const cleaned = value.replace(/[^\d+]/g, '')
  return cleaned ? `tel:${cleaned}` : null
}

const buildEmailLink = (value: string): string | null => {
  if (!value) return null
  const subject = encodeURIComponent(`Info Event ${eventData.value?.title ?? ''}`.trim())
  const body = encodeURIComponent(leadGeneratorMessage.value)
  return `mailto:${value}?subject=${subject}&body=${body}`
}

// --- Share Functionality ---
const shareUrl = computed(() => `${config.public.siteUrl}/event/${slug}`)
const shareText = computed(() => `${eventData.value.title} - ${eventData.value.location_name}`)
const showSharePopover = ref(false)
const copyLinkSuccess = ref(false)

const registrationUrl = computed(() => {
  const rawUrl = eventData.value?.registration_url?.trim()
  if (!rawUrl) return ''
  try {
    return new URL(rawUrl).toString()
  } catch {
    return rawUrl
  }
})

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
      :breadcrumbs="breadcrumbs"
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
                  class="p-2 rounded-lg bg-secondary hover:bg-secondary/20 text-primary transition-colors flex-shrink-0"
                  title="Bagikan Event"
                >
                  <IconMdiShareVariant class="h-5 w-5 text-primary" />
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
            <div
              v-if="eventData.description"
              class="rich-content"
            >
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="eventData.description" />
            </div>
            <p
              v-else
              class="lg:text-base text-sm text-gray-500 leading-relaxed"
            >
              Deskripsi event belum tersedia.
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
                    v-if="item.label.toLowerCase().includes('whatsapp') && buildWhatsappUrl(item.value)"
                    :href="buildWhatsappUrl(item.value) || undefined"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 text-gray-600 hover:text-secondary font-medium text-sm w-full"
                  >
                    <IconMdiWhatsapp class="h-5 w-5 text-[#25D366] flex-shrink-0" />
                    {{ item.value }}
                  </a>
                  <div
                    v-else-if="item.label.toLowerCase().includes('whatsapp')"
                    class="flex items-center gap-3 text-gray-600 font-medium text-sm w-full"
                  >
                    <IconMdiWhatsapp class="h-5 w-5 text-[#25D366] flex-shrink-0" />
                    {{ item.value }}
                  </div>
                  <!-- Email -->
                  <a
                    v-else-if="item.label.toLowerCase().includes('email') && buildEmailLink(item.value)"
                    :href="buildEmailLink(item.value) || undefined"
                    class="flex items-center gap-3 text-gray-600 hover:text-secondary font-medium text-sm w-full"
                  >
                    <IconMdiEmail class="h-5 w-5 text-gray-600 flex-shrink-0" />
                    {{ item.value }}
                  </a>
                  <div
                    v-else-if="item.label.toLowerCase().includes('email')"
                    class="flex items-center gap-3 text-gray-600 font-medium text-sm w-full"
                  >
                    <IconMdiEmail class="h-5 w-5 text-gray-600 flex-shrink-0" />
                    {{ item.value }}
                  </div>
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
                  <!-- Phone -->
                  <a
                    v-else-if="['phone', 'telepon', 'telp', 'contact'].some(keyword =>
                      item.label.toLowerCase().includes(keyword),
                    ) && buildTelUrl(item.value)"
                    :href="buildTelUrl(item.value) || undefined"
                    class="flex items-center gap-3 text-gray-600 hover:text-secondary font-medium text-sm w-full"
                  >
                    <IconMdiPhone class="h-5 w-5 text-gray-600 flex-shrink-0" />
                    {{ item.value }}
                  </a>
                  <!-- Other -->
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
              v-if="eventPosterImage"
              class="rounded-2xl overflow-hidden"
            >
              <img
                :src="eventPosterImage"
                :alt="eventData.title"
                class="w-full h-full object-cover"
                width="800"
                height="1000"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              >
            </div>

            <!-- Registration CTA -->
            <div
              v-if="registrationUrl"
              class="rounded-2xl border border-secondary bg-white p-4 text-center space-y-3"
            >
              <h3 class="lg:text-lg text-base font-bold text-primary">
                Daftar Sekarang
              </h3>
              <NuxtLink
                :to="registrationUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 font-semibold text-primary transition hover:bg-primary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70 focus-visible:ring-offset-2 text-sm"
              >
                Link Pendaftaran
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event FAQ Section -->
    <div
      v-if="eventFaqItems.length > 0"
      class="space-y-10 lg:space-y-16 bg-surface py-10"
    >
      <!-- Event-Specific FAQ (auto-generated from event data) -->
      <div
        v-if="eventFaqItems.length > 0"
        class="space-y-10"
      >
        <div class="bg-surface py-10 border-t border-secondary/20 rounded-2xl">
          <div class="layout-container space-y-10">
            <div class="max-w-3xl mx-auto text-center">
              <h2 class="text-2xl lg:text-3xl font-bold text-primary tracking-tighter leading-[1.2]">
                Pertanyaan Seputar {{ eventData.title }}
              </h2>
              <p class="mt-4 text-gray-600 text-sm lg:text-base">
                Jawaban lengkap tentang detail event, registrasi, dan benefit peserta
              </p>
            </div>

            <!-- Event FAQ Accordion -->
            <div class="space-y-4 max-w-3xl mx-auto">
              <div
                v-for="(item, index) in eventFaqItems"
                :key="index"
                class="rounded-2xl border border-secondary/30 bg-white transition-all duration-300"
              >
                <button
                  class="w-full px-6 py-4 flex items-center justify-between text-left gap-4"
                  @click="eventFaqExpandedIndex = eventFaqExpandedIndex === index ? null : index"
                >
                  <span class="font-semibold text-primary leading-snug">{{ item.question }}</span>
                  <IconMdiChevronDown
                    class="h-6 w-6 text-secondary flex-shrink-0 transition-transform"
                    :class="{ 'rotate-180': eventFaqExpandedIndex === index }"
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
                    v-if="eventFaqExpandedIndex === index"
                    class="overflow-hidden"
                  >
                    <div class="px-6 pb-5 pt-2 border-t border-secondary/20">
                      <p class="text-gray-700 text-sm lg:text-base leading-relaxed">
                        {{ item.answer }}
                      </p>
                    </div>
                  </div>
                </transition>
              </div>
            </div>

            <!-- CTA for registration -->
            <div class="flex justify-center pt-4">
              <NuxtLink
                :to="eventData.registration_url || '#'"
                :external="!!eventData.registration_url"
                class="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-primary font-semibold rounded-full hover:bg-secondary/90 transition-colors"
              >
                <span>Daftar Sekarang</span>
                <IconHeroiconsArrowRight20Solid class="h-4 w-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- SILO STRUCTURE: Internal Links untuk SEO -->
      <div class="layout-container mt-10">
        <div class="rounded-2xl border border-secondary/30 bg-white p-6">
          <h3 class="text-lg font-bold text-primary mb-4 font-saira">
            Jelajahi Event & Panduan Lainnya
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <!-- Link ke Provinsi Page -->
            <NuxtLink
              v-if="eventData.province"
              :to="`/event/provinsi/${eventData.province.toLowerCase().replace(/\s+/g, '-')}`"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition"
            >
              <IconHeroiconsMapPin20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
              <span>Lihat Event Lari di <strong>{{ eventData.province }}</strong></span>
            </NuxtLink>

            <!-- Link ke Kategori/Tipe Page -->
            <NuxtLink
              v-if="eventData.event_type"
              :to="`/event/kategori/${eventData.event_type}`"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition"
            >
              <IconHeroiconsTag20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
              <span>Event {{ formatEventType(eventData.event_type) }} Lainnya</span>
            </NuxtLink>

            <!-- Link ke Blog/Panduan -->
            <NuxtLink
              to="/blog/apa-itu-marathon-jarak-lari"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition"
            >
              <IconHeroiconsBookOpen20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
              <span>Panduan Lengkap Marathon</span>
            </NuxtLink>

            <!-- Link ke Komunitas -->
            <NuxtLink
              to="/ekosistem/komunitas-lari"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition"
            >
              <IconHeroiconsUserGroup20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
              <span>Komunitas Lari Indonesia</span>
            </NuxtLink>

            <!-- Link ke All Events -->
            <NuxtLink
              to="/event"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition"
            >
              <IconHeroiconsMapPin20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
              <span>Lihat Semua Event Lari</span>
            </NuxtLink>

            <!-- Link ke Tips Training -->
            <NuxtLink
              to="/blog"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition"
            >
              <IconHeroiconsBookOpen20Solid class="h-4 w-4 text-secondary flex-shrink-0" />
              <span>Tips Training & Persiapan</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
