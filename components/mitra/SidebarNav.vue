<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import IconHeroiconsRectangleGroup from '~icons/heroicons/rectangle-group'
import IconHeroiconsDocumentPlus from '~icons/heroicons/document-plus'
import IconHeroiconsCalendarDays from '~icons/heroicons/calendar-days'
import IconHeroiconsUserCircle from '~icons/heroicons/user-circle'
import IconMdiChevronRight from '~icons/mdi/chevron-right'

interface NavItem {
  label: string
  path: string
  icon: typeof IconHeroiconsRectangleGroup
  description?: string
}

const route = useRoute()

const navItems = ref<NavItem[]>([
  { label: 'Dashboard', path: '/mitra/dashboard', icon: IconHeroiconsRectangleGroup, description: 'Ringkasan event Anda' },
  { label: 'Kirim Event', path: '/mitra/event/submit', icon: IconHeroiconsDocumentPlus, description: 'Buat event baru' },
  { label: 'Event Saya', path: '/mitra/my-events', icon: IconHeroiconsCalendarDays, description: 'Kelola event Anda' },
  { label: 'Profil', path: '/mitra/profile', icon: IconHeroiconsUserCircle, description: 'Atur akun Anda' },
])

const isActive = (path: string): boolean => route.path === path || route.path.startsWith(`${path}/`)
</script>

<template>
  <aside class="sticky top-20">
    <div class="rounded-2xl border border-secondary bg-white overflow-hidden">
      <nav class="space-y-0">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'group relative flex items-center gap-3.5 px-4 py-3.5 transition-all duration-200',
            'border-b border-secondary/10 last:border-b-0',
            isActive(item.path)
              ? 'bg-secondary/10 text-primary'
              : 'text-gray-700 hover:bg-gray-50/50',
          ]"
        >
          <!-- Icon Highlight Background -->
          <div
            :class="[
              'flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 flex-shrink-0',
              isActive(item.path)
                ? 'bg-secondary text-primary'
                : 'bg-gray-100 text-gray-600 group-hover:bg-secondary/15 group-hover:text-secondary',
            ]"
          >
            <component
              :is="item.icon"
              class="h-5 w-5"
            />
          </div>

          <!-- Text Content -->
          <div class="flex-1 min-w-0">
            <div :class="['text-sm font-semibold leading-tight', isActive(item.path) ? 'text-primary' : 'text-gray-900']">
              {{ item.label }}
            </div>
            <div
              v-if="item.description"
              :class="[
                'text-xs leading-tight transition-colors duration-200',
                isActive(item.path) ? 'text-primary/70' : 'text-gray-500 group-hover:text-gray-700',
              ]"
            >
              {{ item.description }}
            </div>
          </div>

          <!-- Chevron Icon (Active Only) -->
          <div
            :class="[
              'transition-all duration-200 flex-shrink-0',
              isActive(item.path)
                ? 'translate-x-0 opacity-100'
                : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50',
            ]"
          >
            <IconMdiChevronRight class="h-4 w-4 text-secondary" />
          </div>
        </NuxtLink>
      </nav>
    </div>
  </aside>
</template>

