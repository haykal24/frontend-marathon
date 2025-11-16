<script setup lang="ts">
import { computed } from 'vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useAdBanners } from '~/composables/useAdBanners'
import IconMdiRunFast from '~icons/mdi/run-fast'
import IconMdiMedal from '~icons/mdi/medal'
import IconMdiAccountGroup from '~icons/mdi/account-group'
import IconMdiTshirtCrew from '~icons/mdi/tshirt-crew'
import IconMdiCamera from '~icons/mdi/camera'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'

const { getImage } = useSiteSettings()
const { fetchResponsiveBanners } = useAdBanners()

// --- SEO ---
const pageTitle = 'Ekosistem Indonesia Marathon'
const pageDescription =
  'Temukan direktori lengkap vendor medali, jasa race management, hingga komunitas lari terpercaya di seluruh Indonesia untuk mendukung event dan hobi larimu.'
useSeoMetaDynamic({
  title: `${pageTitle} - Vendor, Komunitas & Jasa`,
  description: pageDescription,
  url: '/ekosistem',
})

// --- Breadcrumb & Header ---
const breadcrumbItems = computed<BreadcrumbItem[]>(() => [{ text: 'Ekosistem', link: null }])
const headerBg = computed(() => getImage('header_bg_ekosistem', null) ?? undefined)
const { data: ecosystemHeaderBanners } = await useAsyncData(
  'ad-banners-page-header-ekosistem',
  () => fetchResponsiveBanners('page_header_ekosistem')
)
const headerAdBanners = computed(() => ecosystemHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => ecosystemHeaderBanners.value?.mobile ?? [])

// --- Navigation Cards ---
const ecosystemCategories = [
  {
    name: 'Race Management',
    description: 'Jasa penyelenggaraan dan manajemen event lari profesional.',
    link: '/ekosistem/race-management',
    icon: IconMdiRunFast,
  },
  {
    name: 'Vendor Medali',
    description: 'Produsen medali custom berkualitas untuk event Anda.',
    link: '/ekosistem/vendor-medali',
    icon: IconMdiMedal,
  },
  {
    name: 'Vendor Jersey',
    description: 'Temukan produsen jersey lari custom untuk tim atau event.',
    link: '/ekosistem/vendor-jersey',
    icon: IconMdiTshirtCrew,
  },
  {
    name: 'Fotografer Lari',
    description: 'Jasa race photography profesional untuk event Anda.',
    link: '/ekosistem/vendor-fotografer',
    icon: IconMdiCamera,
  },
  {
    name: 'Komunitas Lari',
    description: 'Temukan dan bergabung dengan komunitas lari di kotamu.',
    link: '/ekosistem/komunitas-lari',
    icon: IconMdiAccountGroup,
  },
]
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="cat in ecosystemCategories"
            :key="cat.name"
            :to="cat.link"
            class="group relative flex h-full flex-col justify-between rounded-2xl border border-secondary/30 bg-white p-6 shadow-sm transition-colors hover:border-secondary overflow-hidden"
          >
            <div class="relative z-10">
              <h2
                class="text-xl font-bold text-primary transition-colors group-hover:text-secondary"
              >
                {{ cat.name }}
              </h2>
              <p class="mt-2 text-sm text-gray-600 leading-relaxed">
                {{ cat.description }}
              </p>
            </div>

            <UiAppButton
              :to="cat.link"
              variant="primary"
              size="sm"
              class="self-end mt-4 relative z-10"
              :icon="IconHeroiconsArrowRight20Solid"
            >
              Lihat Direktori
            </UiAppButton>

            <!-- Watermark Icon -->
            <div class="absolute -right-4 top-0 h-24 w-24 rounded-full bg-secondary/20 blur-xl" />
            <div
              class="absolute right-4 top-4 text-primary/20 group-hover:text-primary/30 transition-colors"
            >
              <component
                :is="cat.icon"
                class="h-14 w-14"
              />
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
