<script setup lang="ts">
/* eslint-disable vue/no-v-html */
import { computed } from 'vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'
import LayoutPageHeader from '~/components/layout/PageHeader.vue'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useStaticPage } from '~/composables/useStaticPage'
import { useSchemaOrg, defineWebPage } from '#imports'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'
import IconHeroiconsEnvelopeOpen20Solid from '~icons/heroicons/envelope-open-20-solid'
import IconHeroiconsPhoneArrowUpRight20Solid from '~icons/heroicons/phone-arrow-up-right-20-solid'
import IconHeroiconsMapPin20Solid from '~icons/heroicons/map-pin-20-solid'
import IconHeroiconsClock20Solid from '~icons/heroicons/clock-20-solid'
import IconHeroiconsChatBubbleLeftRight20Solid from '~icons/heroicons/chat-bubble-left-right-20-solid'
import IconHeroiconsPaperAirplane20Solid from '~icons/heroicons/paper-airplane-20-solid'
import IconMdiInstagram from '~icons/mdi/instagram'
import IconMdiFacebook from '~icons/mdi/facebook'
import IconSimpleIconsX from '~icons/simple-icons/x'
import IconSimpleIconsTiktok from '~icons/simple-icons/tiktok'

const siteSettings = useSiteSettings()
const siteName = computed(
  () => siteSettings.getSetting<string>('site_name', 'indonesiamarathon.com') ?? 'indonesiamarathon.com'
)

const headerBg = computed(
  () =>
    siteSettings.getImage(
      'header_bg_contact',
      siteSettings.getImage('header_bg_static', siteSettings.getImage('header_bg_events', null))
    ) ?? undefined
)

const contactEmail = computed(
  () => siteSettings.getSetting<string>('contact_email', 'halo@indonesiamarathon.com') ?? 'halo@indonesiamarathon.com'
)
const contactWhatsapp = computed(
  () => siteSettings.getSetting<string>('contact_whatsapp', '0812-0000-0000') ?? '0812-0000-0000'
)
const contactWhatsappDigits = computed(() => contactWhatsapp.value.replace(/\D/g, ''))
const contactAddress = computed(
  () => siteSettings.getSetting<string>('contact_address', 'Jakarta, Indonesia') ?? 'Jakarta, Indonesia'
)
const instagramHandle = computed(
  () => siteSettings.getSetting<string>('instagram_handle', '@indonesiamarathon') ?? '@indonesiamarathon'
)
const facebookUrl = computed(
  () => siteSettings.getSetting<string>('facebook_url', 'https://facebook.com/indonesiamarathon') ??
    'https://facebook.com/indonesiamarathon'
)
const twitterHandle = computed(
  () => siteSettings.getSetting<string>('twitter_handle', '@indonesiamarathon') ?? '@indonesiamarathon'
)
const tiktokHandle = computed(
  () => siteSettings.getSetting<string>('tiktok_handle', '@indonesiamarathon') ?? '@indonesiamarathon'
)
const contactHoursPrimary = computed(
  () =>
    siteSettings.getSetting<string>('contact_hours_primary', 'Senin–Jumat 09.00–17.00 WIB') ??
    'Senin–Jumat 09.00–17.00 WIB'
)
const contactHoursPrimaryNote = computed(
  () =>
    siteSettings.getSetting<string>(
      'contact_hours_primary_note',
      'Balasan tercepat via WhatsApp & email. Di luar jam kerja silakan tinggalkan pesan, tim kami akan follow-up maksimal keesokan harinya.'
    ) ??
    'Balasan tercepat via WhatsApp & email. Di luar jam kerja silakan tinggalkan pesan, tim kami akan follow-up maksimal keesokan harinya.'
)
const contactHoursSecondary = computed(
  () => siteSettings.getSetting<string>('contact_hours_secondary', 'Sabtu 09.00–13.00 WIB') ?? 'Sabtu 09.00–13.00 WIB'
)
const contactHoursSecondaryNote = computed(
  () =>
    siteSettings.getSetting<string>(
      'contact_hours_secondary_note',
      'Tim siaga untuk koreksi data urgent & admin event.'
    ) ?? 'Tim siaga untuk koreksi data urgent & admin event.'
)

const {
  title: pageTitle,
  seoTitle,
  seoDescription,
  renderedContent,
  pending,
  error,
} = await useStaticPage('kontak', {
  defaultTitle: 'Kontak',
  defaultDescription: 'Hubungi tim kami untuk kolaborasi brand, dukungan komunitas, atau koreksi data event.',
})

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [{ text: pageTitle.value, link: null }])

const supportBlocks = computed(() => [
  {
    title: 'Koreksi Data Event',
    description:
      'Temukan jadwal yang berubah atau info salah? Kirim detail koreksi, kami update dalam <strong>1x24 jam</strong>.',
    icon: IconHeroiconsChatBubbleLeftRight20Solid,
  },
  {
    title: 'Kolaborasi & Rate Card',
    description:
      'Ingin event atau brand Anda tampil premium di halaman utama? Tim komersial kami siap bantu paket terbaik.',
    icon: IconHeroiconsPaperAirplane20Solid,
  },
])

const contactInfoItems = computed(() => [
  {
    title: 'Email Support',
    description: 'Balasan dalam 1x24 jam kerja.',
    value: contactEmail.value,
    href: `mailto:${contactEmail.value}`,
    icon: IconHeroiconsEnvelopeOpen20Solid,
  },
  {
    title: 'WhatsApp Partner',
    description: 'Respons cepat untuk mitra & media.',
    value: contactWhatsapp.value,
    href: `https://wa.me/${contactWhatsappDigits.value}`,
    icon: IconHeroiconsPhoneArrowUpRight20Solid,
  },
  {
    title: 'Kantor / Studio',
    description: 'Temui tim kami (by appointment).',
    value: contactAddress.value,
    icon: IconHeroiconsMapPin20Solid,
  },
])

const formatHandle = (handle?: string | null) => handle?.replace('@', '').trim()

const socialLinks = computed(() => {
  const links: Array<{
    label: string
    value: string
    href: string
    icon: any
    brandColor: string
    iconColor: string
  }> = []

  const instagram = formatHandle(instagramHandle.value)
  if (instagram) {
    links.push({
      label: 'Instagram',
      value: `@${instagram}`,
      href: `https://instagram.com/${instagram}`,
      icon: IconMdiInstagram,
      brandColor: '#E1306C',
      iconColor: '#FFFFFF',
    })
  }

  if (facebookUrl.value) {
    links.push({
      label: 'Facebook',
      value: 'facebook.com/indonesiamarathon',
      href: facebookUrl.value,
      icon: IconMdiFacebook,
      brandColor: '#1877F2',
      iconColor: '#FFFFFF',
    })
  }

  const twitter = formatHandle(twitterHandle.value)
  if (twitter) {
    links.push({
      label: 'X',
      value: `@${twitter}`,
      href: `https://twitter.com/${twitter}`,
      icon: IconSimpleIconsX,
      brandColor: '#0F1419',
      iconColor: '#FFFFFF',
    })
  }

  const tiktok = formatHandle(tiktokHandle.value)
  if (tiktok) {
    links.push({
      label: 'TikTok',
      value: `@${tiktok}`,
      href: `https://tiktok.com/@${tiktok}`,
      icon: IconSimpleIconsTiktok,
      brandColor: '#000000',
      iconColor: '#FFFFFF',
    })
  }

  return links
})

useSeoMetaDynamic({
  title: seoTitle,
  description: seoDescription,
  url: '/kontak',
})

// SEO: OG Image menggunakan fallback og.webp (static page)

// SEO: Schema.org untuk halaman kontak
useSchemaOrg([
  defineWebPage({
    name: pageTitle.value,
    description: seoDescription.value,
  }),
  // ContactPage schema
  {
    '@type': 'ContactPage',
    name: pageTitle.value,
    description: seoDescription.value,
  },
])
</script>

<template>
  <div class="bg-surface min-h-screen">
    <LayoutPageHeader
      :title="pageTitle"
      :description="`Hubungi tim ${siteName} untuk kolaborasi dan dukungan komunitas.`"
      :breadcrumbs="breadcrumbItems"
      :background-image-url="headerBg"
    />

    <section class="py-10">
      <div class="layout-container">
        <div class="rounded-3xl border border-secondary bg-white/90 p-6 lg:p-10 backdrop-blur space-y-8">
          <div class="text-center space-y-3 max-w-3xl mx-auto">
            <span class="badge-modern inline-flex items-center gap-2 justify-center">
              <IconHeroiconsSparkles20Solid class="h-4 w-4" />
              Kolaborasi & Dukungan
            </span>
            <p class="text-sm uppercase tracking-[0.35em] text-gray-500">
              Hubungi {{ siteName }}
            </p>
            <h2 class="text-3xl lg:text-4xl font-bold text-primary tracking-tighter leading-[1.1]">
              Terhubung langsung dengan tim {{ siteName }}.
            </h2>
            <p class="text-sm text-gray-600">
              Kami melayani koreksi data event, kerjasama brand, hingga pertanyaan komunitas. Pilih jalur komunikasi yang paling nyaman atau kirim email untuk dokumentasi formal.
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div class="space-y-8">

              <div class="grid gap-4 md:grid-cols-2">
                <article
                  v-for="block in supportBlocks"
                  :key="block.title"
                  class="rounded-2xl border border-secondary bg-surface/80 p-4 space-y-2"
                >
                  <div class="flex items-center gap-3">
                    <component
                      :is="block.icon"
                      class="h-8 w-8 rounded-2xl bg-secondary/10 p-2 text-secondary flex-shrink-0"
                    />
                    <p class="font-semibold text-primary">{{ block.title }}</p>
                  </div>
                  <p
                    class="mt-2 text-sm text-gray-600"
                    v-html="block.description"
                  />
                </article>
              </div>

              <div class="rounded-2xl border border-secondary bg-surface/80 p-5">
                <p class="text-xs uppercase tracking-[0.35em] text-gray-500">
                  Panduan Layanan
                </p>
                <template v-if="pending">
                  <div class="space-y-3 mt-3">
                    <div class="h-4 w-32 rounded-full bg-secondary/10 animate-pulse" />
                    <div class="space-y-2">
                      <div class="h-4 w-full rounded-full bg-secondary/10 animate-pulse" />
                      <div class="h-4 w-5/6 rounded-full bg-secondary/10 animate-pulse" />
                      <div class="h-4 w-2/3 rounded-full bg-secondary/10 animate-pulse" />
                    </div>
                  </div>
                </template>
                <p
                  v-else-if="error"
                  class="mt-3 text-sm text-gray-500"
                >
                  Informasi panduan belum tersedia. Silakan coba beberapa saat lagi.
                </p>
                <div
                  v-else-if="renderedContent"
                  class="rich-content mt-4"
                  v-html="renderedContent"
                />
                <p
                  v-else
                  class="mt-3 text-sm text-gray-600"
                >
                  Semua permintaan ditangani melalui ticketing internal kami agar progres dapat dipantau oleh tim terkait.
                </p>
              </div>
            </div>

            <div class="space-y-5">
              <div
                v-for="info in contactInfoItems"
                :key="info.title"
                class="rounded-2xl border border-secondary bg-surface/80 p-4 space-y-2"
              >
                <div class="flex items-center gap-3">
                  <component
                    :is="info.icon"
                    class="h-8 w-8 rounded-2xl bg-secondary/10 p-2 text-secondary flex-shrink-0"
                  />
                  <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-gray-500">{{ info.title }}</p>
                    <p class="text-sm text-gray-600">{{ info.description }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <a
                    v-if="info.href"
                    :href="info.href"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition"
                  >
                    {{ info.value }}
                    <IconHeroiconsPaperAirplane20Solid class="h-4 w-4" />
                  </a>
                  <p
                    v-else
                    class="text-sm font-semibold text-primary"
                  >
                    {{ info.value }}
                  </p>
                </div>
              </div>

              <div class="rounded-2xl border border-secondary bg-surface/80 p-4 space-y-2">
                <div class="flex items-center justify-between gap-3 border-b border-secondary/20 pb-3">
                  <div>
                    <p class="text-xs uppercase tracking-[0.35em] text-gray-500">
                      Jam Operasional
                    </p>
                    <p class="mt-1 text-sm font-semibold text-primary">{{ contactHoursPrimary }}</p>
                    <p class="text-sm text-gray-600">
                      {{ contactHoursPrimaryNote }}
                    </p>
                </div>
                </div>
                <div class="mt-4 grid gap-3">
                  <div class="flex items-start gap-3 text-sm text-gray-600">
                    <IconHeroiconsClock20Solid class="h-8 w-8 rounded-2xl bg-secondary/10 p-2 text-secondary flex-shrink-0" />
                    <div>
                    <p class="font-semibold text-primary">Respons Cepat</p>
                    <p>{{ contactHoursPrimaryNote }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3 rounded-2xl border border-secondary bg-surface/80 px-3 py-3 text-sm text-gray-700">
                    <IconHeroiconsClock20Solid class="h-8 w-8 rounded-2xl bg-secondary/10 p-2 text-secondary flex-shrink-0" />
                    <div>
                    <p class="font-semibold text-primary">{{ contactHoursSecondary }}</p>
                    <p>{{ contactHoursSecondaryNote }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="socialLinks.length"
                class="rounded-2xl border border-secondary bg-surface/80 p-4 space-y-2"
              >
                <p class="text-xs uppercase tracking-[0.35em] text-gray-500 mb-3">
                  Sosial Media
                </p>
                <div class="flex flex-wrap gap-3">
                  <a
                    v-for="social in socialLinks"
                    :key="social.label"
                    :href="social.href"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm transition hover:opacity-90"
                    :style="{ backgroundColor: social.brandColor, color: social.iconColor }"
                    :aria-label="`${social.label} ${social.value}`"
                    :title="`${social.label} ${social.value}`"
                  >
                    <component
                      :is="social.icon"
                      class="h-5 w-5"
                    />
                    <span class="sr-only">{{ social.label }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

