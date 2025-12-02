<script setup lang="ts">
import { computed } from 'vue'
import IconMdiWeb from '~icons/mdi/web'
import IconMdiEmailOutline from '~icons/mdi/email-outline'
import IconMdiWhatsapp from '~icons/mdi/whatsapp'
import IconMdiMapMarker from '~icons/mdi/map-marker'
import IconMdiInstagram from '~icons/mdi/instagram'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import { buildWhatsappUrl, formatWebsiteDisplay } from '~/utils/contact'

interface Props {
  item: {
    id: number
    name: string
    slug?: string
    type?: string
    type_raw?: string
    logo_url?: string | null
    description?: string | null
    website?: string | null
    email?: string | null
    phone?: string | null
    city?: string | null
    location?: string | null
    instagram_handle?: string | null
    is_featured?: boolean
  }
  itemType?: 'community' | 'vendor' // Untuk menentukan route detail
}

const props = withDefaults(defineProps<Props>(), {
  itemType: 'vendor', // Default ke vendor
})

const displayLocation = computed(() => {
  // Prioritaskan 'location' (untuk Komunitas), lalu 'city' (untuk Vendor)
  return props.item.location || props.item.city
})

// Generate detail link
const detailLink = computed(() => {
  // Slug sekarang selalu ada dari API (setelah fix backend)
  if (!props.item.slug) return null
  
  if (props.itemType === 'community') {
    return `/ekosistem/komunitas-lari/${props.item.slug}`
  }
  
  // Vendor - generic route
  return `/ekosistem/vendor/${props.item.slug}`
})
</script>

<template>
  <div
    class="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300"
    :class="[
      props.item.is_featured ? 'border-secondary' : 'border-secondary/30',
      detailLink ? 'hover:border-secondary cursor-pointer' : ''
    ]"
  >
    <!-- Overlay Link untuk seluruh card (seperti EventCard) -->
    <NuxtLink
      v-if="detailLink"
      :to="detailLink"
      class="absolute inset-0 z-0"
      :aria-label="`Lihat detail ${props.item.name}`"
    />
    
    <!-- Featured Badge -->
    <div
      v-if="props.item.is_featured"
      class="absolute top-0 left-0 z-10"
    >
      <span class="badge-label rounded-br-2xl">
        <IconHeroiconsSparkles20Solid class="h-4 w-4" />
        Favorit
      </span>
    </div>

    <!-- Header: Logo & Name -->
    <div
      class="relative z-10 flex items-center gap-4 p-5"
      :class="{ 'pt-8': props.item.is_featured }"
    >
      <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-surface">
        <NuxtImg
          v-if="props.item.logo_url"
          :src="props.item.logo_url"
          :alt="`Logo ${props.item.name}`"
          class="h-full w-full object-cover"
          format="webp"
          loading="lazy"
          sizes="64px"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-black text-white"
        >
          <span class="text-xl font-semibold">{{ props.item.name.charAt(0) }}</span>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <!-- Judul bisa diklik jika ada detailLink -->
        <NuxtLink
          v-if="detailLink"
          :to="detailLink"
          class="block"
          @click.stop
        >
        <h3 
            class="text-lg font-bold text-primary transition-colors group-hover:text-secondary group-hover:underline"
          >
            {{ props.item.name }}
          </h3>
        </NuxtLink>
        <h3 
          v-else
          class="text-lg font-bold text-primary"
        >
          {{ props.item.name }}
        </h3>
        <!-- Cuplikan Deskripsi di bawah nama -->
        <p
          v-if="props.item.description"
          class="mt-2 text-sm text-gray-600 line-clamp-2"
        >
          {{ props.item.description }}
        </p>
        <p
          v-if="props.item.type"
          class="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-500"
        >
          {{ props.item.type.replace(/_/g, ' ') }}
        </p>
      </div>
    </div>

    <!-- Body: Details -->
    <div class="relative z-10 flex flex-1 flex-col justify-between px-5 pb-5">
      <div class="mt-auto space-y-3 pt-4 border-t border-secondary/20">
        <div
          v-if="displayLocation"
          class="flex items-start gap-3 text-sm"
        >
          <IconMdiMapMarker class="h-5 w-5 flex-shrink-0 text-secondary" />
          <span class="text-gray-700">{{ displayLocation }}</span>
        </div>
        <div
          v-if="props.item.instagram_handle"
          class="relative z-20 flex items-center gap-3 text-sm"
        >
          <IconMdiInstagram class="h-5 w-5 flex-shrink-0 text-[#E1306C]" />
          <a
            :href="`https://instagram.com/${props.item.instagram_handle.replace('@', '')}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-700 truncate transition-colors hover:text-secondary"
            @click.stop
          >
            @{{ props.item.instagram_handle.replace('@', '') }}
          </a>
        </div>
        <div
          v-if="props.item.website"
          class="relative z-20 flex items-center gap-3 text-sm"
        >
          <IconMdiWeb class="h-5 w-5 flex-shrink-0 text-[#0EA5E9]" />
          <a
            :href="props.item.website"
            target="_blank"
            rel="noopener noreferrer"
            class="truncate text-gray-700 transition-colors hover:text-secondary"
            @click.stop
          >
            {{ formatWebsiteDisplay(props.item.website) }}
          </a>
        </div>
        <div
          v-if="props.item.email"
          class="relative z-20 flex items-center gap-3 text-sm"
        >
          <IconMdiEmailOutline class="h-5 w-5 flex-shrink-0 text-[#F97316]" />
          <a
            :href="`mailto:${props.item.email}`"
            class="truncate text-gray-700 transition-colors hover:text-secondary"
            @click.stop
          >
            {{ props.item.email }}
          </a>
        </div>
        <div
          v-if="props.item.phone"
          class="relative z-20 flex items-center gap-3 text-sm"
        >
          <IconMdiWhatsapp class="h-5 w-5 flex-shrink-0 text-[#25D366]" />
          <a
            :href="buildWhatsappUrl(props.item.phone) || '#'"
            target="_blank"
            rel="noopener noreferrer"
            class="truncate text-gray-700 transition-colors hover:text-secondary"
            @click.stop
          >
            {{ props.item.phone }}
          </a>
        </div>
        
        <!-- Tombol Lihat Detail -->
        <div
          v-if="detailLink"
          class="relative z-20 mt-4 flex justify-end"
        >
          <NuxtLink
            :to="detailLink"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70 focus-visible:ring-offset-2"
            @click.stop
          >
            <span>Lihat Detail</span>
            <IconHeroiconsArrowRight20Solid class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
