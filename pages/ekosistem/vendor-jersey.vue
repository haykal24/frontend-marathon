<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { Vendor } from '~/types/ecosystem'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useEcosystem } from '~/composables/useEcosystem'
import EcosystemCard from '~/components/ecosystem/EcosystemCard.vue'
import IconMdiViewGrid from '~icons/mdi/view-grid'
import IconMdiViewList from '~icons/mdi/view-list'
import IconMdiWhatsapp from '~icons/mdi/whatsapp'
import IconMdiEmailOutline from '~icons/mdi/email-outline'
import IconMdiWeb from '~icons/mdi/web'
import IconMdiMapMarker from '~icons/mdi/map-marker'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import { buildWhatsappUrl, formatWebsiteDisplay } from '~/utils/contact'
import EcosystemTable from '~/components/ecosystem/EcosystemTable.vue'
import { useAdBanners } from '~/composables/useAdBanners'

// --- Composables ---
const { getVendors } = useEcosystem()
const { getImage } = useSiteSettings()
const { fetchResponsiveBanners } = useAdBanners()

// --- SEO & Page Info ---
const pageTitle = 'Daftar Vendor Jersey Lari Custom'
const pageDescription =
  'Cari vendor jersey lari custom terbaik di Indonesia. Direktori lengkap produsen dan konveksi jersey printing untuk event lari atau komunitasmu.'

useSeoMetaDynamic({
  title: pageTitle,
  description: pageDescription,
  url: '/ekosistem/vendor-jersey',
})

// SEO: OG Image menggunakan fallback og.webp (collection page)

// --- State & Data Fetching ---
const items = ref<Vendor[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const viewMode = ref<'grid' | 'table'>('grid')

async function fetchItems(page = 1, append = false) {
  if (isLoading.value || isLoadingMore.value) return

  if (append) {
    isLoadingMore.value = true
  } else {
    isLoading.value = true
  }

  try {
    const response = await getVendors({ type: 'jersey', page, per_page: 12 })
    if (append) {
      items.value.push(...response.data)
    } else {
      items.value = response.data
    }
    currentPage.value = response.meta?.pagination?.current_page ?? 1
    lastPage.value = response.meta?.pagination?.last_page ?? 1
  } catch (error) {
    console.error('Failed to fetch jersey vendors:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Initial fetch
await fetchItems(1)

const config = useRuntimeConfig()

useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/ekosistem/vendor-jersey`,
    name: pageTitle,
    description: pageDescription,
  }),
  defineItemList({
    itemListElement: computed(() =>
      items.value.map((vendor: Vendor, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Organization',
          name: vendor.name,
          url: `${config.public.siteUrl}/ekosistem/vendor-jersey#${vendor.id}`,
        },
      }))
    ),
  }),
])

// --- Breadcrumbs & Header ---
const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { text: 'Ekosistem', link: '/ekosistem' },
  { text: 'Vendor Jersey', link: null },
])
const headerBg = computed(() => getImage('header_bg_vendor_jersey', null) ?? undefined)
const { data: vendorJerseyHeaderBanners } = await useAsyncData(
  'ad-banners-page-header-vendor-jersey',
  () => fetchResponsiveBanners('page_header_vendor_jersey')
)
const headerAdBanners = computed(() => vendorJerseyHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => vendorJerseyHeaderBanners.value?.mobile ?? [])
const totalCount = computed(() => items.value.length)

</script>

<template>
  <div>
    <LayoutPageHeader
      :title="pageTitle"
      :description="pageDescription"
      :breadcrumbs="breadcrumbItems"
      :background-image-url="headerBg"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <section class="bg-surface py-10">
      <div class="layout-container">
        <!-- Toolbar -->
        <div
          class="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-secondary/20 bg-white/80 px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-600"
        >
          <p class="min-w-0 font-medium">
            Total
            <span class="font-semibold text-primary">{{ totalCount }}</span><span class="inline sm:hidden" />
            <span class="hidden sm:inline"> vendor jersey terdaftar.</span>
            <span class="inline sm:hidden"> Vendor</span>
          </p>
          <div
            class="inline-flex flex-shrink-0 items-center gap-1 sm:gap-2 rounded-xl border border-secondary/30 bg-surface px-1 py-1"
          >
            <button
              :class="[
                'flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm font-medium transition-colors',
                viewMode === 'grid'
                  ? 'bg-secondary text-primary'
                  : 'text-gray-500 hover:text-primary',
              ]"
              @click="viewMode = 'grid'"
            >
              <IconMdiViewGrid class="h-4 w-4" />
              Grid
            </button>
            <button
              :class="[
                'flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm font-medium transition-colors',
                viewMode === 'table'
                  ? 'bg-secondary text-primary'
                  : 'text-gray-500 hover:text-primary',
              ]"
              @click="viewMode = 'table'"
            >
              <IconMdiViewList class="h-4 w-4" />
              Tabel
            </button>
          </div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="isLoading && items.length === 0">
          <div
            v-if="viewMode === 'grid'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="i in 6"
              :key="`skel-grid-${i}`"
              class="h-80 rounded-2xl bg-white animate-pulse"
            />
          </div>
          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="i in 8"
              :key="`skel-table-${i}`"
              class="h-16 rounded-xl bg-white animate-pulse"
            />
          </div>
        </div>

        <!-- Content -->
        <div v-else-if="items.length > 0">
          <!-- Grid -->
          <div
            v-if="viewMode === 'grid'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
          >
            <EcosystemCard
              v-for="vendor in items"
              :id="`${vendor.id}`"
              :key="vendor.id"
              :item="vendor"
              item-type="vendor"
            />
          </div>

          <!-- Table -->
          <EcosystemTable v-else>
            <template #header>
              <tr>
                <th
                  scope="col"
                  class="px-4 py-4 sm:px-6 max-w-[280px]"
                >
                  Nama Vendor
                </th>
                <th
                  scope="col"
                  class="px-4 py-4 sm:px-6 w-48"
                >
                  Jenis
                </th>
                <th
                  scope="col"
                  class="px-4 py-4 sm:px-6 w-48"
                >
                  Lokasi
                </th>
                <th
                  scope="col"
                  class="px-4 py-4 sm:px-6 min-w-56"
                >
                  Kontak
                </th>
                <th
                  scope="col"
                  class="px-4 py-4 sm:px-6 w-32"
                >
                  Aksi
                </th>
              </tr>
            </template>
            <template #body>
              <tr
                v-for="vendor in items"
                :key="vendor.id"
                class="transition-colors hover:bg-secondary/5"
              >
                <td class="px-4 py-4 sm:px-6 max-w-[280px]">
                  <div class="flex flex-col gap-1">
                    <NuxtLink
                      v-if="vendor.slug"
                      :to="`/ekosistem/vendor/${vendor.slug}`"
                      class="font-semibold text-primary break-words line-clamp-2 hover:text-secondary transition"
                    >
                      {{ vendor.name }}
                    </NuxtLink>
                    <span
                      v-else
                      class="font-semibold text-primary break-words line-clamp-2"
                    >
                      {{ vendor.name }}
                    </span>
                    <span
                      v-if="vendor.description"
                      class="text-xs text-gray-500 line-clamp-1 break-words"
                    >{{
                      vendor.description
                    }}</span>
                  </div>
                </td>
                <td class="px-4 py-4 sm:px-6 text-gray-700 capitalize">
                  {{ vendor.type?.replace(/_/g, ' ') || '—' }}
                </td>
                <td class="px-4 py-4 sm:px-6">
                  <div class="flex items-center gap-2 text-gray-700">
                    <IconMdiMapMarker class="h-4 w-4 text-secondary" />
                    <span>{{ vendor.city || '—' }}</span>
                  </div>
                </td>
                <td class="px-4 py-4 sm:px-6">
                  <div class="flex flex-wrap items-center gap-2">
                    <a
                      v-if="vendor.phone && buildWhatsappUrl(vendor.phone)"
                      :href="buildWhatsappUrl(vendor.phone) || '#'"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 px-3 py-1 text-xs font-semibold text-[#1A9E51] transition-colors hover:bg-[#25D366]/20"
                    >
                      <IconMdiWhatsapp class="h-4 w-4" />
                      WhatsApp
                    </a>
                    <a
                      v-if="vendor.email"
                      :href="`mailto:${vendor.email}`"
                      class="inline-flex items-center gap-2 rounded-full bg-[#F97316]/10 px-3 py-1 text-xs font-semibold text-[#C2410C] transition-colors hover:bg-[#F97316]/20"
                    >
                      <IconMdiEmailOutline class="h-4 w-4" />
                      {{ vendor.email }}
                    </a>
                    <a
                      v-if="vendor.website"
                      :href="vendor.website"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 rounded-full bg-[#0EA5E9]/10 px-3 py-1 text-xs font-semibold text-[#0369A1] transition-colors hover:bg-[#0EA5E9]/20"
                    >
                      <IconMdiWeb class="h-4 w-4" />
                      {{ formatWebsiteDisplay(vendor.website) }}
                    </a>
                    <span
                      v-if="!vendor.phone && !vendor.email && !vendor.website"
                      class="text-gray-400"
                    >—</span>
                  </div>
                </td>
                <td class="px-4 py-4 sm:px-6">
                  <NuxtLink
                    v-if="vendor.slug"
                    :to="`/ekosistem/vendor/${vendor.slug}`"
                    class="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-secondary"
                  >
                    <span>Detail</span>
                    <IconHeroiconsArrowRight20Solid class="h-3.5 w-3.5" />
                  </NuxtLink>
                  <span
                    v-else
                    class="text-gray-400 text-xs"
                  >—</span>
                </td>
              </tr>
            </template>
          </EcosystemTable>
          <!-- Load More Button -->
          <div
            v-if="currentPage < lastPage"
            class="mt-10 flex justify-center"
          >
            <UiAppButton
              variant="primary"
              size="md"
              :is-loading="isLoadingMore"
              @click="fetchItems(currentPage + 1, true)"
            >
              Lihat Lebih Banyak
            </UiAppButton>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-12 rounded-2xl border border-dashed border-secondary/30 bg-white"
        >
          <h3 class="text-xl font-semibold text-primary">
            Belum Ada Data
          </h3>
          <p class="mt-2 text-gray-500">
            Data vendor jersey belum tersedia. Silakan cek kembali nanti.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
