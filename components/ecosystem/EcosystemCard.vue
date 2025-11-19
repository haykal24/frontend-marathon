<script setup lang="ts">
import { computed } from 'vue'
import IconMdiWeb from '~icons/mdi/web'
import IconMdiEmailOutline from '~icons/mdi/email-outline'
import IconMdiWhatsapp from '~icons/mdi/whatsapp'
import IconMdiMapMarker from '~icons/mdi/map-marker'
import IconMdiInstagram from '~icons/mdi/instagram'
import IconHeroiconsSparkles20Solid from '~icons/heroicons/sparkles-20-solid'
import { buildWhatsappUrl, formatWebsiteDisplay } from '~/utils/contact'

interface Props {
  item: {
    id: number
    name: string
    type?: string
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
}

const props = defineProps<Props>()

const displayLocation = computed(() => {
  // Prioritaskan 'location' (untuk Komunitas), lalu 'city' (untuk Vendor)
  return props.item.location || props.item.city
})
</script>

<template>
  <div
    class="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:border-secondary"
    :class="[item.is_featured ? 'border-secondary' : 'border-secondary/30']"
  >
    <!-- Featured Badge -->
    <div
      v-if="item.is_featured"
      class="absolute top-0 left-0 z-10"
    >
      <span class="badge-label rounded-br-2xl">
        <IconHeroiconsSparkles20Solid class="h-4 w-4" />
        Favorit
      </span>
    </div>

    <!-- Header: Logo & Name -->
    <div
      class="flex items-center gap-4 p-5"
      :class="{ 'pt-8': item.is_featured }"
    >
      <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-surface">
        <NuxtImg
          v-if="item.logo_url"
          :src="item.logo_url"
          :alt="`Logo ${item.name}`"
          class="h-full w-full object-cover"
          preset="avatar"
          width="64"
          height="64"
          format="webp"
          loading="lazy"
          sizes="64px"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-black text-white"
        >
          <span class="text-xl font-semibold">{{ item.name.charAt(0) }}</span>
        </div>
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-bold text-primary transition-colors group-hover:text-secondary">
          {{ item.name }}
        </h3>
        <p
          v-if="item.type"
          class="text-xs font-semibold uppercase tracking-wider text-gray-500"
        >
          {{ item.type.replace(/_/g, ' ') }}
        </p>
      </div>
    </div>

    <!-- Body: Description & Details -->
    <div class="flex flex-1 flex-col justify-between px-5 pb-5">
      <p
        v-if="item.description"
        class="mb-4 text-sm text-gray-600 line-clamp-3"
      >
        {{ item.description }}
      </p>

      <div class="mt-auto space-y-3 pt-4 border-t border-secondary/20">
        <div
          v-if="displayLocation"
          class="flex items-start gap-3 text-sm"
        >
          <IconMdiMapMarker class="h-5 w-5 flex-shrink-0 text-secondary" />
          <span class="text-gray-700">{{ displayLocation }}</span>
        </div>
        <div
          v-if="item.instagram_handle"
          class="flex items-center gap-3 text-sm"
        >
          <IconMdiInstagram class="h-5 w-5 flex-shrink-0 text-[#E1306C]" />
          <a
            :href="`https://instagram.com/${item.instagram_handle.replace('@', '')}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-700 truncate transition-colors hover:text-secondary"
          >
            @{{ item.instagram_handle.replace('@', '') }}
          </a>
        </div>
        <div
          v-if="item.website"
          class="flex items-center gap-3 text-sm"
        >
          <IconMdiWeb class="h-5 w-5 flex-shrink-0 text-[#0EA5E9]" />
          <a
            :href="item.website"
            target="_blank"
            rel="noopener noreferrer"
            class="truncate text-gray-700 transition-colors hover:text-secondary"
          >
            {{ formatWebsiteDisplay(item.website) }}
          </a>
        </div>
        <div
          v-if="item.email"
          class="flex items-center gap-3 text-sm"
        >
          <IconMdiEmailOutline class="h-5 w-5 flex-shrink-0 text-[#F97316]" />
          <a
            :href="`mailto:${item.email}`"
            class="truncate text-gray-700 transition-colors hover:text-secondary"
          >
            {{ item.email }}
          </a>
        </div>
        <div
          v-if="item.phone"
          class="flex items-center gap-3 text-sm"
        >
          <IconMdiWhatsapp class="h-5 w-5 flex-shrink-0 text-[#25D366]" />
          <a
            :href="buildWhatsappUrl(item.phone) || '#'"
            target="_blank"
            rel="noopener noreferrer"
            class="truncate text-gray-700 transition-colors hover:text-secondary"
          >
            {{ item.phone }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
