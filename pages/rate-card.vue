<script setup lang="ts">
import { computed } from 'vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import type { RatePackage } from '~/types/rate-package'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useRatePackages } from '~/composables/useRatePackages'
import { useAdBanners } from '~/composables/useAdBanners'
import { useStaticPage } from '~/composables/useStaticPage'
import { useSchemaOrg, defineWebPage } from '#imports'
import IconHeroiconsArrowTopRightOnSquare20Solid from '~icons/heroicons/arrow-top-right-on-square-20-solid'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'
import IconHeroiconsMegaphone20Solid from '~icons/heroicons/megaphone-20-solid'
import IconHeroiconsMegaphone from '~icons/heroicons/megaphone'
import IconHeroiconsUsers20Solid from '~icons/heroicons/users-20-solid'
import IconHeroiconsChartBar20Solid from '~icons/heroicons/chart-bar-20-solid'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconMdiWhatsapp from '~icons/mdi/whatsapp'
import IconMdiEmailOutline from '~icons/mdi/email-outline'
import IconMdiWeb from '~icons/mdi/web'
import EcosystemTable from '~/components/ecosystem/EcosystemTable.vue'
import { buildWhatsappUrl } from '~/utils/contact'
import { useCurrentYear } from '~/composables/useCurrentYear'

const siteSettings = useSiteSettings()
const { fetchRatePackages } = useRatePackages()
const { fetchResponsiveBanners } = useAdBanners()
const config = useRuntimeConfig()
const { currentYear } = useCurrentYear()

const PAGE_TITLE = 'Rate Card Iklan & Kolaborasi'
const PAGE_DESCRIPTION =
  'Promosikan event atau brand lari Anda dengan paket iklan terintegrasi di indonesiamarathon.com: website, sosial media, newsletter, hingga aktivasi komunitas.'

const {
  title: staticPageTitle,
  seoTitle: staticSeoTitle,
  seoDescription: staticSeoDescription,
  renderedContent: rateCardHeroContent,
} = await useStaticPage('rate-card', {
  defaultTitle: PAGE_TITLE,
  defaultDescription: PAGE_DESCRIPTION,
})

const pageTitle = computed(() => staticPageTitle.value || `${PAGE_TITLE}`)
const pageDescription = computed(() => staticSeoDescription.value || PAGE_DESCRIPTION)

useSeoMetaDynamic({
  title: computed(() => staticSeoTitle.value || `${PAGE_TITLE} ${currentYear.value}`),
  description: computed(() => staticSeoDescription.value || PAGE_DESCRIPTION),
  url: '/rate-card',
})

useSchemaOrg([
  defineWebPage({
    '@id': `${config.public.siteUrl}/rate-card`,
    name: pageTitle.value,
    description: pageDescription.value,
  }),
])

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [{ text: 'Rate Card', link: null }])

const headerBg = computed(
  () =>
    siteSettings.getImage('header_bg_rate_card', siteSettings.getImage('header_bg_events', null)) ??
    undefined
)

const { data: rateCardHeaderBanners } = await useAsyncData(
  'ad-banners-page-header-rate-card',
  () => fetchResponsiveBanners('page_header_rate_card'),
  { default: () => ({ desktop: [], mobile: [] }) }
)
const headerAdBanners = computed(() => rateCardHeaderBanners.value?.desktop ?? [])
const headerAdBannersMobile = computed(() => rateCardHeaderBanners.value?.mobile ?? [])

const { data: ratePackagesData } = await useAsyncData<RatePackage[]>(
  'rate-packages',
  () => fetchRatePackages({ is_active: true }),
  { default: () => [] }
)
const ratePackages = computed(() => ratePackagesData.value ?? [])

const contactEmail = computed(() => siteSettings.getSetting<string>('contact_email', null))
const contactWhatsapp = computed(() => siteSettings.getSetting<string>('contact_whatsapp', null))
const whatsappUrl = computed(() =>
  contactWhatsapp.value ? buildWhatsappUrl(contactWhatsapp.value) : null
)

const categoryMeta = computed(() => {
  const map: Record<string, { label: string; description: string | null; order: number }> = {}
  ratePackages.value.forEach(pkg => {
    const slug = pkg.category_slug || pkg.category || 'lainnya'
    if (!map[slug]) {
      map[slug] = {
        label: pkg.category_label || slug,
        description: pkg.category_description || null,
        order: pkg.category_order ?? 999,
      }
    }
  })
  return map
})

const packagesByCategory = computed<Record<string, RatePackage[]>>(() => {
  const groups: Record<string, RatePackage[]> = {}
  ratePackages.value.forEach(pkg => {
    const slug = pkg.category_slug || pkg.category || 'lainnya'
    if (!groups[slug]) groups[slug] = []
    groups[slug].push(pkg)
  })
  return groups
})

const orderedCategories = computed(() => {
  const entries = Object.entries(packagesByCategory.value)
  return entries
    .filter(([, pkgs]) => pkgs.length > 0)
    .sort((a, b) => {
      const metaA = categoryMeta.value[a[0]]
      const metaB = categoryMeta.value[b[0]]
      const orderA = metaA?.order ?? 999
      const orderB = metaB?.order ?? 999
      return orderA === orderB ? a[0].localeCompare(b[0]) : orderA - orderB
    })
    .map(([slug]) => slug)
})

const categoryLabels = computed(() => {
  const map = categoryMeta.value
  return Object.fromEntries(
    Object.keys(map).map(key => {
      const meta = map[key]
      return [key, meta?.label ?? key]
    })
  )
})

const categoryDescriptions = computed(() => {
  const map = categoryMeta.value
  return Object.fromEntries(
    Object.keys(map).map(key => {
      const meta = map[key]
      return [key, meta?.description ?? 'Paket kolaborasi untuk memperkuat campaign brand Anda.']
    })
  )
})

const valueProps = computed(() => [
  {
    icon: IconHeroiconsSparkles20Solid,
    title: 'Visibilitas SEO Maksimal',
    description:
      'Event atau brand Anda otomatis ditemukan di Google untuk kata kunci seperti "jadwal lari" atau "kalender marathon".',
  },
  {
    icon: IconHeroiconsUsers20Solid,
    title: 'Audiens Instan & Tertarget',
    description:
      'Terhubung langsung dengan puluhan ribu pelari aktif & komunitas yang siap mendaftar event baru.',
  },
  {
    icon: IconHeroiconsMegaphone20Solid,
    title: 'Jangkauan Web & Instagram',
    description:
      'Promosi Anda hadir di website indonesiamarathon.com dan akun Instagram @indonesiamarathon.',
  },
  {
    icon: IconHeroiconsChartBar20Solid,
    title: 'Data Performa Transparan',
    description: 'Pantau impresi, klik, dan konversi pendaftaran via laporan kampanye kami.',
  },
])

const hasPackages = computed(() => ratePackages.value.length > 0)
</script>

<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="min-h-screen">
    <LayoutPageHeader
      :title="pageTitle"
      :description="pageDescription"
      :breadcrumbs="breadcrumbItems"
      :background-image-url="headerBg"
      :ad-banners="headerAdBanners"
      :ad-banners-mobile="headerAdBannersMobile"
    />

    <section class="py-10">
      <div class="layout-container bg-surface">
        <div
          class="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div class="space-y-6">
            <div class="space-y-3">
              <span class="badge-modern inline-flex items-center gap-2">
                <IconHeroiconsMegaphone20Solid class="h-4 w-4" />
                Paket Kolaborasi Terintegrasi
              </span>
              <p class="text-sm uppercase tracking-[0.35em] text-gray-500">
                Omnichannel untuk ekosistem pelari
              </p>
              <h2 class="text-2xl lg:text-4xl font-bold text-primary tracking-tighter leading-[1.15]">
                Jadikan brand Anda tampil dominan di ekosistem pelari Indonesia.
              </h2>
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div
              v-if="rateCardHeroContent"
              class="text-sm lg:text-base prose prose-sm lg:prose-base max-w-none text-gray-600"
              v-html="rateCardHeroContent"
            />
            <div
              v-else
              class="space-y-4 text-sm lg:text-base text-gray-600 leading-relaxed"
            >
              <p>
                <strong>indonesiamarathon.com</strong> bukan sekadar kalender. Kami adalah ekosistem
                digital #1 dan pusat otoritas komunitas pelari di Indonesia dengan jaringan media,
                sosial, dan komunitas yang aktif.
              </p>
              <p class="leading-relaxed text-gray-600 text-sm lg:text-base">
                Bermitra dengan kami berarti brand Anda hadir di momen yang tepat: ketika pelari
                mencari jadwal lari, merencanakan event, dan butuh partner terpercaya.
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <UiAppButton
                :to="whatsappUrl || '/kontak'"
                :external="!!whatsappUrl"
                :target="whatsappUrl ? '_blank' : undefined"
                size="md"
                variant="primary"
                :icon="IconHeroiconsArrowTopRightOnSquare20Solid"
              >
                Diskusikan via WhatsApp
              </UiAppButton>
              <UiAppButton
                v-if="contactEmail"
                :to="`mailto:${contactEmail}`"
                size="sm"
                variant="secondary"
                :icon="IconHeroiconsArrowRight20Solid"
              >
                Email Kami
              </UiAppButton>
              <UiAppButton
                v-else
                to="/kontak"
                size="sm"
                variant="secondary"
                :icon="IconHeroiconsArrowRight20Solid"
              >
                Form Kontak
              </UiAppButton>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div
              v-for="(prop, index) in valueProps"
              :key="index"
              class="relative flex h-full flex-col justify-center gap-3 rounded-2xl border border-secondary bg-white px-5 py-6 overflow-hidden"
            >
              <div class="relative z-10 space-y-2 pr-16">
                <h3 class="text-base font-semibold text-primary leading-snug">
                  {{ prop.title }}
                </h3>
                <p class="text-sm text-gray-600 leading-relaxed">
                  {{ prop.description }}
                </p>
              </div>
              <div class="absolute -right-6 -top-2 h-20 w-20 rounded-full bg-secondary/15 blur-xl" />
              <div class="absolute right-2 top-2 text-primary/15">
                <component
                  :is="prop.icon"
                  class="h-10 w-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-10 bg-white">
      <div class="layout-container space-y-6">
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <span class="badge-modern inline-flex items-center gap-2 justify-center w-fit mx-auto">
            <IconHeroiconsSparkles20Solid class="h-4 w-4" />
            Paket Kolaborasi {{ currentYear }}
          </span>
          <h2 class="text-2xl lg:text-4xl font-bold text-primary tracking-tighter leading-[1.15]">
            Rate Card terkurasi untuk setiap objektif kampanye
          </h2>
          <p class="text-sm lg:text-base text-gray-600">
            Pilih paket dengan kombinasi placement web, sosial media, newsletter, hingga aktivasi komunitas.
          </p>
        </div>
        <div v-if="hasPackages" class="space-y-10">
          <template
            v-for="category in orderedCategories"
            :key="category"
          >
            <div
              v-if="packagesByCategory[category]?.length"
              class="space-y-10"
            >
              <div class="flex flex-col gap-3 text-center lg:text-left">
                <span class="badge-modern inline-flex items-center gap-2 w-fit mx-auto lg:mx-0">
                  <IconHeroiconsMegaphone class="h-4 w-4" />
                  {{ categoryLabels[category] || category.replace(/_/g, ' ') }}
                </span>
                <h3 class="text-2xl font-bold text-primary tracking-tighter leading-[1.2]">
                  {{ categoryLabels[category] || category.replace(/_/g, ' ') }}
                </h3>
                <p class="text-sm text-gray-600 max-w-3xl mx-auto lg:mx-0">
                  {{
                    categoryDescriptions[category] ||
                      'Paket kolaborasi untuk memperkuat campaign brand Anda.'
                  }}
                </p>
              </div>

              <EcosystemTable background="surface" class="border border-secondary">
                  <template #header class="bg-surface">
                    <tr>
                      <th class="px-4 py-4 text-left max-w-[280px]">Paket & Deskripsi</th>
                      <th class="px-4 py-4 text-left whitespace-nowrap">Durasi</th>
                      <th class="px-4 py-4 text-left">Benefit</th>
                      <th class="px-4 py-4 text-left">Channel</th>
                      <th class="px-4 py-4 text-left whitespace-nowrap">Harga</th>
                      <th class="px-4 py-4 text-left">Kontak</th>
                    </tr>
                  </template>
                  <template #body>
                    <tr
                      v-for="pkg in packagesByCategory[category]"
                      :key="pkg.id"
                      class="align-top bg-white"
                    >
                      <td class="px-4 py-5 space-y-2 text-gray-900 max-w-[280px]">
                        <span class="text-base font-semibold tracking-tight text-primary block break-words">
                          {{ pkg.name }}
                        </span>
                        <p
                          v-if="pkg.description"
                          class="text-sm text-gray-600 leading-relaxed break-words"
                        >
                          {{ pkg.description }}
                        </p>
                        <p class="text-xs text-gray-500 break-words">
                          Audience: {{ pkg.audience || 'Pelari & komunitas running di Indonesia' }}
                        </p>
                      </td>
                    <td class="px-4 py-5 text-sm text-gray-600 min-w-[140px] whitespace-nowrap">
                      <span
                        v-if="pkg.duration"
                        class="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {{ pkg.duration }}
                      </span>
                      <span
                        v-else
                        class="text-xs text-gray-400"
                      >
                        -
                      </span>
                    </td>
                    <td class="px-4 py-5 text-sm text-gray-600 min-w-[200px]">
                      <ul
                        v-if="pkg.deliverables.length"
                        class="space-y-2"
                      >
                        <li
                          v-for="(deliverable, idx) in pkg.deliverables"
                          :key="idx"
                          class="flex items-start gap-3"
                        >
                          <span class="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-secondary" />
                          <span class="leading-relaxed text-gray-600 flex-1">{{ deliverable }}</span>
                        </li>
                      </ul>
                      <span
                        v-else
                        class="text-xs text-gray-400"
                      >-</span>
                    </td>
                    <td class="px-4 py-5 text-sm text-gray-600 min-w-[200px]">
                      <div
                        v-if="pkg.channels.length"
                        class="flex flex-wrap gap-2"
                      >
                        <span
                          v-for="(channel, idx) in pkg.channels"
                          :key="idx"
                          class="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {{ channel }}
                        </span>
                      </div>
                      <span
                        v-else
                        class="text-xs text-gray-400"
                      >-</span>
                    </td>
                    <td class="px-4 py-5 min-w-[140px] whitespace-nowrap">
                      <span
                        class="inline-flex items-center rounded-full bg-secondary/10 px-4 py-1 text-xs font-semibold text-primary whitespace-nowrap"
                      >
                        {{ pkg.price_display || 'Hubungi kami' }}
                      </span>
                    </td>
                    <td class="px-4 py-5 min-w-[220px]">
                      <div class="flex flex-wrap items-center gap-2">
                        <a
                          v-if="pkg.cta_url"
                          :href="pkg.cta_url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-secondary/20"
                        >
                          <IconMdiWeb class="h-4 w-4" />
                          {{ pkg.cta_label || 'Detail Paket' }}
                        </a>
                        <a
                          v-if="whatsappUrl"
                          :href="whatsappUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 px-3 py-1 text-xs font-semibold text-[#1A9E51] transition-colors hover:bg-[#25D366]/20"
                        >
                          <IconMdiWhatsapp class="h-4 w-4" />
                          WhatsApp
                        </a>
                        <a
                          v-if="contactEmail"
                          :href="`mailto:${contactEmail}`"
                          class="inline-flex items-center gap-2 rounded-full bg-[#F97316]/10 px-3 py-1 text-xs font-semibold text-[#C2410C] transition-colors hover:bg-[#F97316]/20"
                        >
                          <IconMdiEmailOutline class="h-4 w-4" />
                          Email
                        </a>
                        <span
                          v-if="!pkg.cta_url && !whatsappUrl && !contactEmail"
                          class="text-xs text-gray-400"
                        >
                          —
                        </span>
                      </div>
                    </td>
                  </tr>
                </template>
              </EcosystemTable>
            </div>
          </template>
        </div>

        <div
          v-else
          class="rounded-2xl border border-dashed border-secondary/40 bg-white py-16 text-center text-gray-500"
        >
          Paket rate card belum tersedia. Silakan hubungi tim kami untuk informasi terbaru.
        </div>
      </div>
    </section>

    <section class="py-10">
      <div class="layout-container">
        <div
          class="rounded-2xl border border-secondary/30 bg-primary text-white text-center lg:text-left flex flex-col lg:flex-row items-center gap-6 p-6 lg:p-10"
        >
          <div class="flex-1 space-y-3">
            <span class="badge-modern inline-flex items-center gap-2">
              <IconHeroiconsMegaphone20Solid class="h-4 w-4" />
              Siap berkolaborasi?
            </span>
            <h3 class="text-2xl font-bold tracking-tighter leading-[1.2]">
              Hubungi tim kami untuk paket custom dan kolaborasi strategis.
            </h3>
            <p class="text-sm lg:text-base text-white/80 max-w-2xl">
              Kami bantu rekomendasikan kombinasi placement terbaik sesuai tujuan campaign Anda,
              lengkap dengan reporting performa yang transparan.
            </p>
           
          </div>
          <div class="flex flex-wrap gap-3">
            <UiAppButton
              :to="whatsappUrl || '/kontak'"
              :external="!!whatsappUrl"
              :target="whatsappUrl ? '_blank' : undefined"
              variant="primary"
              size="md"
              :icon="IconHeroiconsArrowTopRightOnSquare20Solid"
            >
              Konsultasi via WhatsApp
            </UiAppButton>
            <UiAppButton
              v-if="contactEmail"
              :to="`mailto:${contactEmail}`"
              variant="secondary"
              size="md"
              :icon="IconHeroiconsArrowRight20Solid"
            >
              Kirim Email
            </UiAppButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<!-- eslint-enable vue/no-v-html -->
