<template>
  <div class="min-h-screen bg-primary text-white font-body overflow-hidden">

    <div class="relative z-10 min-h-screen flex flex-col">
      <div class="container mx-auto max-w-md px-4 py-12 sm:px-6 flex-grow">
        <!-- Profile Section - Mobile First -->
        <div class="mb-4 text-center relative">
          <!-- Avatar Container with Smooth Glow -->
          <div class="relative mx-auto inline-block group">
            <div class="relative z-10 rounded-xl bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md ring-1 ring-white/10 overflow-hidden p-2">
              <!-- Shine Effect -->
              <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-20 pointer-events-none"></div>
              
              <ClientOnly>
                <NuxtImg
                  :src="siteLogo"
                  :alt="siteName"
                  class="h-20 w-auto rounded-lg object-contain sm:h-24"
                  format="webp"
                  quality="85"
                  loading="eager"
                  preload
                  fit="contain"
                />
                <template #fallback>
                  <NuxtImg
                    src="/logo.png"
                    alt="Indonesia Marathon"
                    class="h-20 w-auto rounded-lg object-contain sm:h-24"
                    format="webp"
                    quality="85"
                    loading="eager"
                    preload
                    fit="contain"
                  />
                </template>
              </ClientOnly>
            </div>
          </div>

          <ClientOnly>
            <h1 class="mt-4 text-2xl font-semibold tracking-tight leading-tight font-heading text-white sm:text-3xl drop-shadow-lg">
              {{ pageTitle }}
            </h1>
            <template #fallback>
              <h1 class="mt-4 text-2xl font-semibold tracking-tight leading-tight font-heading text-white sm:text-3xl drop-shadow-lg">
                Link Bio
              </h1>
            </template>
          </ClientOnly>
          <ClientOnly>
            <p class="mt-2 text-sm font-medium leading-relaxed text-white/80 sm:text-base max-w-[95%] mx-auto">
              {{ pageDescription }}
            </p>
            <template #fallback>
              <p class="mt-2 text-sm font-medium leading-relaxed text-white/80 sm:text-base max-w-[95%] mx-auto">
                Platform Kalender Lari & Jadwal Marathon #1 di Indonesia
              </p>
            </template>
          </ClientOnly>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="space-y-4">
          <div v-for="i in 5" :key="i" class="h-20 animate-pulse rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl" />
        </div>

        <!-- Links List - Apple-style Liquid Glass -->
        <div v-else class="space-y-4">
          <a 
            v-for="link in links" 
            :key="link.id"
            :href="link.url" 
            target="_blank" 
            rel="noopener noreferrer"
            class="group relative flex items-center gap-4 rounded-2xl p-2 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) hover:scale-[1.02] active:scale-[0.98]"
          >
            <!-- Glass Background Layer -->
            <div class="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] group-hover:bg-white/[0.08] group-hover:border-white/20 transition-all duration-500"></div>
            
            <!-- Top Light Sheen (Liquid effect) -->
            <div class="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/[0.05] to-transparent opacity-100 pointer-events-none"></div>
            
            <!-- Shine Effect -->
            <div class="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            </div>

            <!-- Icon Container -->
            <div 
              class="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500"
              :style="getIconContainerStyle(link.url, link.title)"
            >
              <!-- Custom Image from Backend -->
              <NuxtImg
                v-if="link.image && !imageErrors[link.id]"
                :src="link.image"
                :alt="link.title"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-700"
                width="56"
                height="56"
                format="webp"
                quality="80"
                loading="lazy"
                @error="() => setImageError(link.id)"
              />
              <!-- Auto-detected Icon -->
              <component 
                :is="getIconComponent(link.url, link.title)" 
                class="relative z-10 text-2xl drop-shadow-md transition-transform duration-500"
                :style="getIconColorStyle(link.url, link.title)"
              />
            </div>

            <!-- Text Content -->
            <div class="relative z-10 min-w-0 flex-1 py-1">
              <h3 class="truncate text-[15px] font-semibold text-white/90 group-hover:text-white transition-colors tracking-wide font-heading">
                {{ link.title }}
              </h3>
              <p v-if="link.subtitle" class="mt-0.5 truncate text-xs text-white/50 font-medium group-hover:text-white/70 transition-colors">
                {{ link.subtitle }}
              </p>
            </div>

            <!-- Arrow Icon with Circle -->
            <div class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/5 text-white/30 transition-all duration-500 group-hover:bg-white/10 group-hover:text-white group-hover:translate-x-1">
              <IconMdiChevronRight class="h-5 w-5" />
            </div>
          </a>
        </div>

        <!-- Footer - Compact -->
        <footer class="mt-8 text-center relative z-10">
          <ClientOnly>
            <p class="text-xs font-medium text-white/30 tracking-widest uppercase">
              {{ footerCopyright }}
            </p>
            <template #fallback>
              <p class="text-xs font-medium text-white/30 tracking-widest uppercase">
                © {{ new Date().getFullYear() }} indonesiamarathon.com
              </p>
            </template>
          </ClientOnly>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, resolveComponent } from 'vue'
// Import icons
import IconMdiInstagram from '~icons/mdi/instagram'
import IconMdiFacebook from '~icons/mdi/facebook'
import IconMdiWeb from '~icons/mdi/web'
import IconMdiWhatsapp from '~icons/mdi/whatsapp'
import IconMdiChevronRight from '~icons/mdi/chevron-right'
import IconMdiCalendar from '~icons/mdi/calendar'
import IconMdiInformation from '~icons/mdi/information'
import IconMdiCash from '~icons/mdi/cash'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useStaticPage } from '~/composables/useStaticPage'

definePageMeta({
  layout: false
})

// Static page untuk title dan description
const {
  title: pageTitle,
  seoDescription: pageDescription,
  pending: pagePending,
} = await useStaticPage('bio', {
  defaultTitle: 'Link Bio',
  defaultDescription: 'Platform Kalender Lari & Jadwal Marathon #1 di Indonesia',
})

useHead({
  title: pageTitle.value || 'Link Bio',
  meta: [
    { name: 'description', content: pageDescription.value || 'Tautan resmi Indonesia Marathon: Event, Komunitas, dan Info Lari Terbaru.' },
    { name: 'robots', content: 'noindex, follow' }
  ]
})

const { links, pending: linksPending } = useBioLinks()
const { getSetting, getImage, pending: settingsPending } = useSiteSettings()

// Site Settings untuk logo dan copyright
const DEFAULT_LOGO = '/logo.png'
const currentYear = new Date().getFullYear()
const DEFAULT_SITE_NAME = 'indonesiamarathon.com'

const siteLogo = ref(DEFAULT_LOGO)
const siteName = ref(DEFAULT_SITE_NAME)
const footerCopyright = ref(`© ${currentYear} ${DEFAULT_SITE_NAME}`)

// Update values setelah data ready (prevents hydration mismatch)
watch(
  [settingsPending],
  () => {
    if (!settingsPending.value) {
      const logo = getImage('logo_footer', null) ?? getImage('logo', null)
      if (logo) siteLogo.value = logo
      
      const name = getSetting<string>('site_name', null)
      if (name) siteName.value = name
      
      const copyright = getSetting<string>('footer_copyright', null)
      if (copyright) {
        footerCopyright.value = copyright
      } else {
        footerCopyright.value = `© ${currentYear} ${siteName.value}`
      }
    }
  },
  { immediate: true }
)

// Combined pending state
const pending = computed(() => linksPending.value || pagePending.value)

// Image error handling
const imageErrors = ref<Record<number, boolean>>({})

const setImageError = (id: number) => {
  imageErrors.value[id] = true
}

// --- Helper Functions ---

// Icon mapping
const getIconComponent = (url: string, title?: string) => {
  const lowerUrl = url.toLowerCase()
  const lowerTitle = (title || '').toLowerCase()
  
  if (lowerUrl.includes('instagram.com') || lowerTitle.includes('instagram')) return IconMdiInstagram
  if (lowerUrl.includes('facebook.com') || lowerTitle.includes('facebook')) return IconMdiFacebook
  if (lowerUrl.includes('whatsapp.com') || lowerUrl.includes('wa.me') || lowerTitle.includes('whatsapp')) return IconMdiWhatsapp
  if (lowerUrl.includes('tiktok.com') || lowerTitle.includes('tiktok')) {
    try {
      const icon = resolveComponent('IconSimpleIconsTiktok')
      if (icon) return icon
    } catch {}
  }
  if (lowerUrl.includes('threads.net') || lowerTitle.includes('threads')) {
    try {
      const icon = resolveComponent('IconSimpleIconsThreads')
      if (icon) return icon
    } catch {}
  }
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerTitle.includes('youtube')) {
    try {
      const icon = resolveComponent('IconSimpleIconsYoutube')
      if (icon) return icon
    } catch {}
  }
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com') || lowerTitle.includes('twitter')) {
    try {
      const icon = resolveComponent('IconSimpleIconsTwitter') || resolveComponent('IconSimpleIconsX')
      if (icon) return icon
    } catch {}
  }
  if (lowerUrl.includes('linkedin.com') || lowerTitle.includes('linkedin')) {
    try {
      const icon = resolveComponent('IconSimpleIconsLinkedin')
      if (icon) return icon
    } catch {}
  }
  
  // Custom detection
  if (lowerTitle.includes('kalender') || lowerTitle.includes('event') || lowerUrl.includes('/event')) return IconMdiCalendar
  if (lowerTitle.includes('info') || lowerTitle.includes('partnership') || lowerTitle.includes('kolaborasi')) return IconMdiInformation
  if (lowerTitle.includes('iklan') || lowerTitle.includes('rate') || lowerTitle.includes('slot')) return IconMdiCash
  if (lowerTitle.includes('website') || lowerTitle.includes('site') || lowerTitle.includes('indonesiamarathon')) return IconMdiWeb
  
  return IconMdiWeb
}

// Icon color dengan brand color asli (seperti di halaman kontak)
const getIconColorStyle = (url: string, title?: string) => {
  const lowerUrl = url.toLowerCase()
  const lowerTitle = (title || '').toLowerCase()
  
  // Brand colors asli (dari kontak.vue)
  if (lowerUrl.includes('instagram.com') || lowerTitle.includes('instagram')) {
    return { color: '#FFFFFF' }
  }
  if (lowerUrl.includes('facebook.com') || lowerTitle.includes('facebook')) {
    return { color: '#FFFFFF' }
  }
  if (lowerUrl.includes('whatsapp.com') || lowerUrl.includes('wa.me') || lowerTitle.includes('whatsapp')) {
    return { color: '#FFFFFF' }
  }
  if (lowerUrl.includes('tiktok.com') || lowerTitle.includes('tiktok')) {
    return { color: '#FFFFFF' }
  }
  if (lowerUrl.includes('threads.net') || lowerTitle.includes('threads')) {
    return { color: '#FFFFFF' }
  }
  if (lowerUrl.includes('youtube.com') || lowerTitle.includes('youtube')) {
    return { color: '#FFFFFF' }
  }
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com') || lowerTitle.includes('twitter')) {
    return { color: '#FFFFFF' }
  }
  if (lowerUrl.includes('linkedin.com') || lowerTitle.includes('linkedin')) {
    return { color: '#FFFFFF' }
  }
  
  // Custom colors untuk link khusus
  if (lowerTitle.includes('kalender') || lowerTitle.includes('event')) {
    return { color: '#BEF200' } // secondary
  }
  if (lowerTitle.includes('iklan') || lowerTitle.includes('rate') || lowerTitle.includes('slot')) {
    return { color: '#BEF200' } // secondary
  }
  if (lowerTitle.includes('website')) {
    return { color: '#FFFFFF' }
  }
  
  return { color: 'rgba(255, 255, 255, 0.9)' }
}

// Icon container dengan background brand color asli
const getIconContainerStyle = (url: string, title?: string) => {
  const lowerUrl = url.toLowerCase()
  const lowerTitle = (title || '').toLowerCase()
  
  // Brand colors asli (dari kontak.vue)
  if (lowerUrl.includes('instagram.com') || lowerTitle.includes('instagram')) {
    return { backgroundColor: '#E1306C' } // Instagram brand color
  }
  if (lowerUrl.includes('facebook.com') || lowerTitle.includes('facebook')) {
    return { backgroundColor: '#1877F2' } // Facebook brand color
  }
  if (lowerUrl.includes('whatsapp.com') || lowerUrl.includes('wa.me') || lowerTitle.includes('whatsapp')) {
    return { backgroundColor: '#25D366' } // WhatsApp brand color
  }
  if (lowerUrl.includes('tiktok.com') || lowerTitle.includes('tiktok')) {
    return { backgroundColor: '#000000' } // TikTok brand color
  }
  if (lowerUrl.includes('threads.net') || lowerTitle.includes('threads')) {
    return { backgroundColor: '#000000' } // Threads brand color
  }
  if (lowerUrl.includes('youtube.com') || lowerTitle.includes('youtube')) {
    return { backgroundColor: '#FF0000' } // YouTube brand color
  }
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com') || lowerTitle.includes('twitter')) {
    return { backgroundColor: '#0F1419' } // X/Twitter brand color
  }
  if (lowerUrl.includes('linkedin.com') || lowerTitle.includes('linkedin')) {
    return { backgroundColor: '#0077B5' } // LinkedIn brand color
  }
  
  // Custom colors untuk link khusus
  if (lowerTitle.includes('kalender') || lowerTitle.includes('event')) {
    return { backgroundColor: 'rgba(190, 242, 0, 0.1)' } // secondary/10
  }
  if (lowerTitle.includes('iklan') || lowerTitle.includes('rate') || lowerTitle.includes('slot')) {
    return { backgroundColor: 'rgba(190, 242, 0, 0.15)' } // secondary/15
  }
  if (lowerTitle.includes('website')) {
    return { backgroundColor: '#1877F2' } // Blue like Facebook
  }
  
  // Default Glass for others
  return { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
}
</script>

<style scoped>
.cubic-bezier {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>