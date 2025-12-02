<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import IconMdiInstagram from '~icons/mdi/instagram'
import IconMdiFacebook from '~icons/mdi/facebook'
import IconSimpleIconsX from '~icons/simple-icons/x'
import IconSimpleIconsTiktok from '~icons/simple-icons/tiktok'
import IconHeroiconsEnvelope from '~icons/heroicons/envelope'
import IconMdiWhatsapp from '~icons/mdi/whatsapp'
import IconHeroiconsHomeModern from '~icons/heroicons/home-modern'
import IconHeroiconsCalendarDays from '~icons/heroicons/calendar-days'
import IconHeroiconsGlobeAlt from '~icons/heroicons/globe-alt'
import IconHeroiconsNewspaper from '~icons/heroicons/newspaper'
import IconHeroiconsInformationCircle from '~icons/heroicons/information-circle'
import IconHeroiconsChatBubbleBottomCenterText from '~icons/heroicons/chat-bubble-bottom-center-text'
import IconHeroiconsShieldCheck from '~icons/heroicons/shield-check'
import IconHeroiconsUserGroup from '~icons/heroicons/user-group'
import IconHeroiconsTrophy from '~icons/heroicons/trophy'
import IconHeroiconsFlag from '~icons/heroicons/flag'
import IconHeroiconsEllipsisHorizontalCircle from '~icons/heroicons/ellipsis-horizontal-circle'
import IconHeroiconsMegaphone from '~icons/heroicons/megaphone'
import IconHeroiconsMapPin from '~icons/heroicons/map-pin'
import IconHeroiconsBuildingOffice2 from '~icons/heroicons/building-office-2'
import IconHeroiconsTag from '~icons/heroicons/tag'
import IconHeroiconsCalendar from '~icons/heroicons/calendar'

import { useSiteSettings } from '~/composables/useSiteSettings'
import { watch } from 'vue'

const currentYear = new Date().getFullYear()

// --- Fetch Site Settings (SSR-safe) ---
const { getSetting, getImage, pending } = useSiteSettings()

// Default values yang konsisten (harus sama dengan yang akan di-fetch)
const DEFAULT_SITE_NAME = 'indonesiamarathon.com'
const DEFAULT_DESCRIPTION =
  'indonesiamarathon.com adalah platform digital #1 untuk kalender lari, ekosistem vendor, dan komunitas pelari di seluruh Indonesia.'
const DEFAULT_LOGO = '/logo.png'

// Use ref dengan default values yang konsisten
const siteName = ref(DEFAULT_SITE_NAME)
const siteDescription = ref(DEFAULT_DESCRIPTION)
const footerCopyright = ref(`© ${currentYear} ${DEFAULT_SITE_NAME}. All rights reserved.`)
const footerLogo = ref(DEFAULT_LOGO)

// Update values setelah data ready (prevents hydration mismatch)
watch(
  [pending],
  () => {
    if (!pending.value) {
      const name = getSetting<string>('site_name', null)
      if (name) siteName.value = name

      const footerDesc = getSetting<string>('footer_description', null)
      if (footerDesc) {
        siteDescription.value = footerDesc
      } else {
        const siteDesc = getSetting<string>('site_description', null)
        if (siteDesc) siteDescription.value = siteDesc
      }

      const copyright = getSetting<string>('footer_copyright', null)
      if (copyright) footerCopyright.value = copyright

      const logo = getImage('logo_footer', null) ?? getImage('logo', null)
      if (logo) footerLogo.value = logo
    }
  },
  { immediate: true }
)

const contactEmail = computed(() => getSetting<string>('contact_email', null))
const _contactPhone = computed(() => getSetting<string>('contact_phone', null))
const contactWhatsapp = computed(() => getSetting<string>('contact_whatsapp', null))
const whatsappLink = computed(() => {
  const value = contactWhatsapp.value
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : null
})

const socialLinks = computed(() => {
  const instagram = getSetting<string>('instagram_handle', null)
  const facebook = getSetting<string>('facebook_url', null)
  const twitter = getSetting<string>('twitter_handle', null)
  const tiktok = getSetting<string>('tiktok_handle', null)

  const normalizedInstagram = instagram
    ? instagram.startsWith('http')
      ? instagram
      : `https://instagram.com/${instagram.replace('@', '')}`
    : null
  const normalizedTwitter = twitter
    ? twitter.startsWith('http')
      ? twitter
      : `https://twitter.com/${twitter.replace('@', '')}`
    : null
  const normalizedTiktok = tiktok
    ? tiktok.startsWith('http')
      ? tiktok
      : `https://www.tiktok.com/${tiktok.replace('@', '')}`
    : null

  const links: Array<{ label: string; href: string; icon: Component }> = []

  if (normalizedInstagram) {
    links.push({
      label: 'Instagram',
      href: normalizedInstagram,
      icon: IconMdiInstagram,
    })
  }

  if (facebook) {
    links.push({
      label: 'Facebook',
      href: facebook,
      icon: IconMdiFacebook,
    })
  }

  if (normalizedTwitter) {
    links.push({
      label: 'X',
      href: normalizedTwitter,
      icon: IconSimpleIconsX,
    })
  }

  if (normalizedTiktok) {
    links.push({
      label: 'TikTok',
      href: normalizedTiktok,
      icon: IconSimpleIconsTiktok,
    })
  }

  return links
})

const contactItems = computed(() => {
  const items: Array<{ label: string; href: string; icon: Component }> = []

  if (contactEmail.value) {
    items.push({
      label: contactEmail.value,
      href: `mailto:${contactEmail.value}`,
      icon: IconHeroiconsEnvelope,
    })
  }

  if (whatsappLink.value) {
    items.push({
      label: contactWhatsapp.value ?? 'WhatsApp',
      href: whatsappLink.value,
      icon: IconMdiWhatsapp,
    })
  }

  return items
})

// Store icons in constants to ensure they're available during SSR
const footerIcons = {
  home: IconHeroiconsHomeModern,
  calendar: IconHeroiconsCalendarDays,
  globe: IconHeroiconsGlobeAlt,
  newspaper: IconHeroiconsNewspaper,
  ellipsis: IconHeroiconsEllipsisHorizontalCircle,
  info: IconHeroiconsInformationCircle,
  chat: IconHeroiconsChatBubbleBottomCenterText,
  shield: IconHeroiconsShieldCheck,
  userGroup: IconHeroiconsUserGroup,
  trophy: IconHeroiconsTrophy,
  flag: IconHeroiconsFlag,
  megaphone: IconHeroiconsMegaphone,
  mapPin: IconHeroiconsMapPin,
  building: IconHeroiconsBuildingOffice2,
  tag: IconHeroiconsTag,
  calendarMonth: IconHeroiconsCalendar,
} as const

const footerLinks = {
  platform: [
    { label: 'Beranda', path: '/', icon: footerIcons.home },
    { label: 'Event Lari', path: '/event', icon: footerIcons.calendar },
    { label: 'Ekosistem', path: '/ekosistem', icon: footerIcons.globe },
    { label: 'Artikel', path: '/blog', icon: footerIcons.newspaper },
    { label: 'Cari Event Di Kota?', path: '/event/kota', icon: footerIcons.mapPin },
    { label: 'Cari Event Di Provinsi?', path: '/event/provinsi', icon: footerIcons.building },
  ],
  informasi: [
    { label: 'FAQ', path: '/faq', icon: footerIcons.ellipsis },
    { label: 'Tentang Kami', path: '/tentang-kami', icon: footerIcons.info },
    { label: 'Kontak', path: '/kontak', icon: footerIcons.chat },
    { label: 'Rate Card', path: '/rate-card', icon: footerIcons.megaphone },
    { label: 'Kalender Bulanan', path: '/event/bulan', icon: footerIcons.calendarMonth },
    { label: 'Kategori Event', path: '/event/kategori', icon: footerIcons.tag },
    { label: 'Kebijakan Privasi', path: '/privacy', icon: footerIcons.shield },
  ],
  ekosistem: [
    { label: 'Komunitas Lari', path: '/ekosistem/komunitas-lari', icon: footerIcons.userGroup },
    { label: 'Vendor Medali', path: '/ekosistem/vendor-medali', icon: footerIcons.trophy },
    { label: 'Race Management', path: '/ekosistem/race-management', icon: footerIcons.flag },
  ],
}

const getSocialHoverClasses = (label: string) => {
  switch (label) {
    case 'Instagram':
      return 'hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white'
    case 'Facebook':
      return 'hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white'
    case 'X':
      return 'hover:bg-[#000000] hover:border-[#000000] hover:text-white'
    case 'TikTok':
      return 'hover:bg-[#000000] hover:border-[#000000] hover:text-white'
    default:
      return 'hover:border-secondary hover:bg-secondary/20 hover:text-secondary'
  }
}
</script>

<template>
  <footer class="bg-primary text-white">
    <div class="layout-container grid gap-6 lg:gap-12 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <div class="space-y-6">
        <NuxtLink
          to="/"
          class="flex items-center gap-3"
        >
          <ClientOnly>
            <NuxtImg
              :src="footerLogo"
              :alt="siteName"
              class="h-16 w-auto"
              :width="240"
              :height="80"
              format="webp"
              loading="lazy"
            />
            <template #fallback>
              <NuxtImg
                src="/logo.png"
                alt="indonesiamarathon.com"
                class="h-16 w-auto"
                :width="240"
                :height="80"
                format="webp"
                loading="lazy"
              />
            </template>
          </ClientOnly>
        </NuxtLink>
        <ClientOnly>
          <p class="max-w-md text-sm leading-relaxed text-white/70">
            {{ siteDescription }}
          </p>
          <template #fallback>
            <p class="max-w-md text-sm leading-relaxed text-white/70">
              indonesiamarathon.com adalah platform digital #1 untuk kalender lari, ekosistem
              vendor, dan komunitas pelari di seluruh Indonesia.
            </p>
          </template>
        </ClientOnly>
      </div>

      <div class="flex flex-col text-sm text-white/70">
        <!-- Platform Column Content -->
        <h3
          class="lg:pl-3 text-base font-semibold uppercase tracking-[0.28em] text-secondary/90 mb-2"
        >
          Platform
        </h3>
        <ul>
          <li
            v-for="link in footerLinks.platform"
            :key="link.path"
          >
            <NuxtLink
              :to="link.path"
              class="inline-flex items-center gap-3 rounded-full px-3 py-2 transition hover:text-secondary"
            >
              <component
                :is="link.icon"
                v-if="link.icon"
                class="h-4 w-4 flex-shrink-0 text-secondary"
              />
              <span>{{ link.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="flex flex-col text-sm text-white/70">
        <!-- Informasi Column Content -->
        <h3
          class="lg:pl-3 text-base font-semibold uppercase tracking-[0.28em] text-secondary/90 mb-2"
        >
          Informasi
        </h3>
        <ul>
          <li
            v-for="link in footerLinks.informasi"
            :key="link.path"
            :class="link.path === '/privacy' ? 'lg:hidden' : ''"
          >
            <NuxtLink
              :to="link.path"
              class="inline-flex items-center gap-3 rounded-full px-3 py-2 transition hover:text-secondary"
            >
              <component
                :is="link.icon"
                v-if="link.icon"
                class="h-4 w-4 flex-shrink-0 text-secondary"
              />
              <span>{{ link.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="flex flex-col text-sm text-white/70">
        <h3
          class="lg:pl-3 text-base font-semibold uppercase tracking-[0.28em] text-secondary/90 mb-2"
        >
          Kontak Kami
        </h3>
        <template v-if="!pending">
          <ul class="space-y-1">
            <li
              v-for="contact in contactItems"
              :key="contact.href"
            >
              <a
                :href="contact.href"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-3 rounded-full px-3 py-2 transition hover:text-secondary"
              >
                <component
                  :is="contact.icon"
                  class="h-4 w-4 flex-shrink-0 text-secondary"
                />
                <span>{{ contact.label }}</span>
              </a>
            </li>
          </ul>

          <div
            v-if="socialLinks.length > 0"
            class="flex items-center gap-3 lg:pl-3 pt-4"
          >
            <a
              v-for="social in socialLinks"
              :key="social.href"
              :href="social.href"
              :class="[
                'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition',
                getSocialHoverClasses(social.label),
              ]"
              rel="noopener noreferrer"
              target="_blank"
              :aria-label="social.label"
            >
              <component
                :is="social.icon"
                :class="social.label === 'X' ? 'h-4 w-4' : 'h-5 w-5'"
              />
            </a>
          </div>
        </template>
        <template v-else>
          <!-- Skeleton Loader -->
          <div class="space-y-2 lg:pl-3">
            <div class="h-4 w-3/4 animate-pulse rounded bg-white/10" />
            <div class="h-4 w-1/2 animate-pulse rounded bg-white/10" />
            <div class="h-4 w-2/3 animate-pulse rounded bg-white/10" />
            <div class="flex items-center space-x-2 pt-4">
              <div class="h-10 w-10 animate-pulse rounded-full bg-white/10" />
              <div class="h-10 w-10 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="border-t border-white/10 bg-primary/95">
      <ClientOnly>
        <div class="layout-container py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <div class="text-center sm:text-left">
            {{ footerCopyright }}
          </div>
          <div class="hidden lg:block">
            <NuxtLink
              to="/privacy"
              class="inline-flex items-center gap-2 hover:text-secondary transition"
            >
              <component
                :is="footerIcons.shield"
                class="h-4 w-4 flex-shrink-0"
              />
              <span>Kebijakan Privasi</span>
            </NuxtLink>
          </div>
        </div>
        <template #fallback>
          <div class="layout-container py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
            <div class="text-center sm:text-left">
              © {{ currentYear }} indonesiamarathon.com. All rights reserved.
            </div>
            <div class="hidden lg:block">
              <NuxtLink
                to="/privacy"
                class="inline-flex items-center gap-2 hover:text-secondary transition"
              >
                <component
                  :is="footerIcons.shield"
                  class="h-4 w-4 flex-shrink-0"
                />
                <span>Kebijakan Privasi</span>
              </NuxtLink>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </footer>
</template>
