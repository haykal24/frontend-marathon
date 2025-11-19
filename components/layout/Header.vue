<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import { useRoute } from '#imports'
import IconHeroiconsArrowLeftOnRectangle20Solid from '~icons/heroicons/arrow-left-on-rectangle-20-solid'
import IconHeroiconsArrowRightOnRectangle20Solid from '~icons/heroicons/arrow-right-on-rectangle-20-solid'
import IconHeroiconsHomeModern from '~icons/heroicons/home-modern'
import IconHeroiconsCalendarDays from '~icons/heroicons/calendar-days'
import IconHeroiconsGlobeAlt from '~icons/heroicons/globe-alt'
import IconHeroiconsNewspaper from '~icons/heroicons/newspaper'
import IconHeroiconsDocumentPlus from '~icons/heroicons/document-plus'
import IconHeroiconsMegaphone from '~icons/heroicons/megaphone'
import IconHeroiconsUserGroup from '~icons/heroicons/user-group'
import IconHeroiconsFlag from '~icons/heroicons/flag'
import IconHeroiconsTrophy from '~icons/heroicons/trophy'
import IconMdiTshirtCrew from '~icons/mdi/tshirt-crew'
import IconMdiCamera from '~icons/mdi/camera'
import IconHeroiconsChevronDown from '~icons/heroicons/chevron-down'
import IconHeroiconsBars3 from '~icons/heroicons/bars-3'
import IconHeroiconsXMark from '~icons/heroicons/x-mark'
import IconHeroiconsUserCircle from '~icons/heroicons/user-circle'
import IconHeroiconsRectangleGroup from '~icons/heroicons/rectangle-group'

import { useAuth } from '~/composables/useAuth'
import { useSiteSettings } from '~/composables/useSiteSettings'

interface NavigationItem {
  label: string
  path: string
  icon: Component
  children?: Array<{
    label: string
    path: string
    icon: Component
  }>
}

const { isAuthenticated, user, logout } = useAuth()
const { getSetting, getImage } = useSiteSettings()
const route = useRoute()

const siteName = computed(
  () => getSetting<string>('site_name', 'Marathon Indonesia') ?? 'Marathon Indonesia'
)
const siteLogo = computed(() => getImage('logo', null) ?? '/logo.png')

// Store icons in a ref to ensure they're available during SSR
// This prevents "is not defined" errors, especially for IconHeroiconsDocumentPlus
const navIcons = shallowRef({
  home: IconHeroiconsHomeModern,
  calendar: IconHeroiconsCalendarDays,
  globe: IconHeroiconsGlobeAlt,
  userGroup: IconHeroiconsUserGroup,
  flag: IconHeroiconsFlag,
  trophy: IconHeroiconsTrophy,
  tshirt: IconMdiTshirtCrew,
  camera: IconMdiCamera,
  megaphone: IconHeroiconsMegaphone,
  newspaper: IconHeroiconsNewspaper,
  documentPlus: IconHeroiconsDocumentPlus,
})

const navigationItems = computed<NavigationItem[]>(() => [
  { label: 'Beranda', path: '/', icon: navIcons.value.home },
  { label: 'Event Lari', path: '/event', icon: navIcons.value.calendar },
  {
    label: 'Ekosistem',
    path: '/ekosistem',
    icon: navIcons.value.globe,
    children: [
      { label: 'Komunitas Lari', path: '/ekosistem/komunitas-lari', icon: navIcons.value.userGroup },
      { label: 'Race Management', path: '/ekosistem/race-management', icon: navIcons.value.flag },
      { label: 'Vendor Medali', path: '/ekosistem/vendor-medali', icon: navIcons.value.trophy },
      { label: 'Vendor Jersey', path: '/ekosistem/vendor-jersey', icon: navIcons.value.tshirt },
      { label: 'Fotografer Lari', path: '/ekosistem/vendor-fotografer', icon: navIcons.value.camera },
      { label: 'Rate Card', path: '/rate-card', icon: navIcons.value.megaphone },
    ],
  },
  { label: 'Artikel', path: '/blog', icon: navIcons.value.newspaper },
  // Always show Submit Event; link resolves to login if not authenticated
  { label: 'Submit Event', path: '/mitra/event/submit', icon: navIcons.value.documentPlus },
])

const filteredNavigationItems = computed(() => navigationItems.value)

const isMenuOpen = ref(false)
const openDropdown = ref<string | null>(null)
const mobileOpenDropdown = ref<string | null>(null)

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)

const isItemActive = (item: NavigationItem) => {
  if (item.children?.length) {
    return (
      route.path === item.path ||
      route.path.startsWith(`${item.path}/`) ||
      item.children.some(
        child => route.path === child.path || route.path.startsWith(`${child.path}/`)
      )
    )
  }
  return isActive(item.path)
}

const findActiveParentLabel = () => {
  const parent = navigationItems.value.find(item => item.children?.length && isItemActive(item))
  return parent?.label ?? null
}

const updateActiveDropdown = () => {
  mobileOpenDropdown.value = findActiveParentLabel()
}

const handleMobileItemClick = (item: NavigationItem, event: Event) => {
  if (item.children?.length) {
    event.preventDefault()
    mobileOpenDropdown.value = mobileOpenDropdown.value === item.label ? null : item.label
  } else {
    isMenuOpen.value = false
  }
}

const userMenuOpen = ref(false)
const userInitials = computed(() => {
  const rawName = (user.value?.name || 'Pelari').trim()
  const nameToUse = rawName || 'Pelari'
  const parts = nameToUse.split(' ').filter(Boolean)
  const first = parts[0]?.[0]
  const second = parts[1]?.[0]
  const initials =
    parts.length >= 2 && first && second
      ? `${first}${second}`
      : first || nameToUse[0] || 'P'
  return initials.toUpperCase()
})

const onGlobalClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('#header-user-menu')) {
    userMenuOpen.value = false
  }
}

const handleMouseEnter = (item: NavigationItem) => {
  if (!item.children?.length) return
  userMenuOpen.value = false
  openDropdown.value = item.label
}

const handleMouseLeave = (item: NavigationItem) => {
  if (!item.children?.length) return
  openDropdown.value = null
}

watch(
  () => route.path,
  () => {
    isMenuOpen.value = false
    openDropdown.value = null
    mobileOpenDropdown.value = null
    updateActiveDropdown()
  }
)

onMounted(() => {
  updateActiveDropdown()
  document.addEventListener('click', onGlobalClick)
})

const resolveLink = (item: NavigationItem) => {
  if (item.label === 'Submit Event' && !isAuthenticated.value) {
    return `/login?next=${encodeURIComponent('/mitra/event/submit')}`
  }
  return item.path
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-primary text-white">
    <nav class="layout-container">
      <div class="flex h-16 items-center justify-between gap-4">
        <NuxtLink
          to="/"
          class="flex items-center gap-3"
        >
          <NuxtImg
            :src="siteLogo"
            :alt="siteName"
            class="h-10 w-auto"
            format="webp"
            loading="lazy"
          />
        </NuxtLink>

        <div class="hidden items-center gap-4 lg:flex">
          <div
            v-for="item in filteredNavigationItems"
            :key="item.path"
            class="relative"
            @mouseenter="handleMouseEnter(item)"
            @mouseleave="handleMouseLeave(item)"
            @focusin="handleMouseEnter(item)"
            @focusout="handleMouseLeave(item)"
          >
            <NuxtLink
              :to="resolveLink(item)"
              :class="[
                'group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                isItemActive(item) || (item.children && openDropdown === item.label)
                  ? 'text-secondary'
                  : 'text-white hover:text-secondary',
              ]"
            >
              <component
                :is="item.icon"
                :class="[
                  'h-5 w-5 transition-colors',
                  isItemActive(item) || (item.children && openDropdown === item.label)
                    ? 'text-secondary'
                    : 'text-white group-hover:text-secondary',
                ]"
              />
              <span>{{ item.label }}</span>
              <IconHeroiconsChevronDown
                v-if="item.children"
                :class="[
                  'h-4 w-4 transition-transform duration-200',
                  openDropdown === item.label
                    ? 'rotate-180 text-secondary'
                    : isItemActive(item)
                      ? 'text-secondary'
                      : 'text-white/60 group-hover:text-secondary',
                ]"
              />
            </NuxtLink>

            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              leave-active-class="transition duration-150 ease-in"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="item.children && openDropdown === item.label"
                class="pointer-events-auto absolute left-0 top-[calc(100%+0.75rem)] z-40 min-w-[15rem] rounded-2xl border border-white/10 bg-primary/95 p-2 text-sm text-white/80 shadow-2xl backdrop-blur"
              >
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.path"
                  :to="child.path"
                  class="group flex items-center gap-3 rounded-xl px-3 py-2 text-white transition hover:text-secondary"
                >
                  <component
                    :is="child.icon"
                    class="h-5 w-5 transition-colors text-white group-hover:text-secondary"
                  />
                  <span>{{ child.label }}</span>
                </NuxtLink>
              </div>
            </transition>
          </div>
        </div>

        <ClientOnly>
          <div class="hidden items-center gap-3 lg:flex">
            <template v-if="isAuthenticated">
              <div
                id="header-user-menu"
                class="relative"
              >
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/20"
                  aria-label="User menu"
                  @click="userMenuOpen = !userMenuOpen; openDropdown = userMenuOpen ? null : openDropdown"
                >
                  <span class="text-xs font-bold">{{ userInitials }}</span>
                </button>
                <transition
                  enter-active-class="transition duration-150 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  leave-active-class="transition duration-100 ease-in"
                  leave-to-class="opacity-0 -translate-y-1"
                >
                  <div
                    v-if="userMenuOpen"
                    class="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-primary/95 p-2 text-sm text-white/80 shadow-2xl backdrop-blur"
                  >
                    <NuxtLink
                      to="/mitra/profile"
                      class="flex items-center gap-3 rounded-xl px-3 py-2 text-white transition hover:text-secondary"
                      @click="userMenuOpen = false; openDropdown = null"
                    >
                      <IconHeroiconsUserCircle class="h-5 w-5" />
                      <span>Profil</span>
                    </NuxtLink>
                    <NuxtLink
                      to="/mitra/dashboard"
                      class="flex items-center gap-3 rounded-xl px-3 py-2 text-white transition hover:text-secondary"
                      @click="userMenuOpen = false; openDropdown = null"
                    >
                      <IconHeroiconsRectangleGroup class="h-5 w-5" />
                      <span>Dashboard Mitra</span>
                    </NuxtLink>
                    <NuxtLink
                      to="/mitra/event/submit"
                      class="flex items-center gap-3 rounded-xl px-3 py-2 text-white transition hover:text-secondary"
                      @click="userMenuOpen = false; openDropdown = null"
                    >
                      <component :is="navIcons.value.documentPlus" class="h-5 w-5" />
                      <span>Submit Event</span>
                    </NuxtLink>
                    <button
                      type="button"
                      class="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-white/80 hover:text-secondary"
                      @click="logout(); userMenuOpen = false; openDropdown = null"
                    >
                      <IconHeroiconsArrowLeftOnRectangle20Solid class="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </transition>
              </div>
            </template>
            <template v-else>
              <UiAppButton
                to="/login"
                variant="outline"
                size="sm"
                class="border-white/60 text-white"
                :icon="IconHeroiconsArrowRightOnRectangle20Solid"
              >
                Login
              </UiAppButton>
            </template>
          </div>
          <template #fallback>
            <div class="hidden items-center gap-3 lg:flex">
              <UiAppButton
                to="/login"
                variant="outline"
                size="sm"
                class="border-white/60 text-white"
                :icon="IconHeroiconsArrowRightOnRectangle20Solid"
              >
                Login
              </UiAppButton>
            </div>
          </template>
        </ClientOnly>

        <button
          class="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:border-secondary/80 hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary lg:hidden"
          aria-label="Toggle menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          <IconHeroiconsBars3
            v-if="!isMenuOpen"
            class="h-6 w-6"
          />
          <IconHeroiconsXMark
            v-else
            class="h-6 w-6"
          />
        </button>
      </div>

      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="isMenuOpen"
          class="space-y-4 border-t border-white/10 py-4 lg:hidden"
        >
          <div class="grid gap-3">
            <div
              v-for="item in filteredNavigationItems"
              :key="`mobile-${item.path}`"
              class="flex flex-col gap-1 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white"
            >
              <NuxtLink
                v-if="!item.children?.length"
                :to="resolveLink(item)"
                class="group flex items-center justify-between gap-3 font-medium transition"
                :class="[isItemActive(item) ? 'text-secondary' : 'hover:text-secondary']"
                @click="isMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <component
                    :is="item.icon"
                    :class="[
                      'h-5 w-5 transition-colors',
                      isItemActive(item)
                        ? 'text-secondary'
                        : 'text-white group-hover:text-secondary',
                    ]"
                  />
                  <span>{{ item.label }}</span>
                </div>
              </NuxtLink>
              <button
                v-else
                type="button"
                class="group flex w-full items-center justify-between gap-3 font-medium transition text-left"
                :class="[
                  isItemActive(item) || mobileOpenDropdown === item.label
                    ? 'text-secondary'
                    : 'hover:text-secondary',
                ]"
                @click="handleMobileItemClick(item, $event)"
              >
                <div class="flex items-center gap-3">
                  <component
                    :is="item.icon"
                    :class="[
                      'h-5 w-5 transition-colors',
                      isItemActive(item)
                        ? 'text-secondary'
                        : 'text-white group-hover:text-secondary',
                    ]"
                  />
                  <span>{{ item.label }}</span>
                </div>
                <IconHeroiconsChevronDown
                  v-if="item.children"
                  :class="[
                    'h-4 w-4 transition-transform duration-200',
                    mobileOpenDropdown === item.label
                      ? 'rotate-180 text-secondary'
                      : isItemActive(item)
                        ? 'text-secondary'
                        : 'text-white/60',
                  ]"
                />
              </button>
              <div
                v-if="item.children && mobileOpenDropdown === item.label"
                class="ml-3 mt-2 flex flex-col gap-1.5 border-l border-white/10 pl-5"
              >
                <NuxtLink
                  v-for="child in item.children"
                  :key="`mobile-${child.path}`"
                  :to="child.path"
                  class="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white transition hover:text-secondary"
                  @click="isMenuOpen = false"
                >
                  <component
                    :is="child.icon"
                    class="h-5 w-5 transition-colors text-white group-hover:text-secondary"
                  />
                  <span>{{ child.label }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>

          <ClientOnly>
            <div class="grid gap-2">
              <template v-if="isAuthenticated">
                <NuxtLink
                  to="/mitra/profile"
                  class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-secondary hover:text-primary"
                  @click="isMenuOpen = false"
                >
                  <div class="flex items-center gap-3">
                    <IconHeroiconsUserCircle class="h-5 w-5" />
                    <span>Profil Saya</span>
                  </div>
                  <span class="text-xs text-white/60">({{ user?.name || 'Pelari' }})</span>
                </NuxtLink>
                <NuxtLink
                  to="/mitra/dashboard"
                  class="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-secondary hover:text-primary"
                  @click="isMenuOpen = false"
                >
                  <IconHeroiconsRectangleGroup class="h-5 w-5" />
                  <span>Dashboard Mitra</span>
                </NuxtLink>
                <NuxtLink
                  to="/mitra/event/submit"
                  class="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-secondary hover:text-primary"
                  @click="isMenuOpen = false"
                >
                  <component :is="navIcons.documentPlus" class="h-5 w-5" />
                  <span>Submit Event</span>
                </NuxtLink>
                <UiAppButton
                  variant="outline"
                  size="sm"
                  class="w-full border-white/40 text-white"
                  :icon="IconHeroiconsArrowLeftOnRectangle20Solid"
                  @click="() => {
                    logout()
                    isMenuOpen = false
                  }"
                >
                  Logout
                </UiAppButton>
              </template>
              <template v-else>
                <UiAppButton
                  to="/login"
                  variant="primary"
                  size="sm"
                  class="w-full"
                  :icon="IconHeroiconsArrowRightOnRectangle20Solid"
                  @click="isMenuOpen = false"
                >
                  Login
                </UiAppButton>
              </template>
            </div>
            <template #fallback>
              <div class="grid gap-2">
                <UiAppButton
                  to="/login"
                  variant="primary"
                  size="sm"
                  class="w-full"
                  :icon="IconHeroiconsArrowRightOnRectangle20Solid"
                  @click="isMenuOpen = false"
                >
                  Login
                </UiAppButton>
              </div>
            </template>
          </ClientOnly>
        </div>
      </transition>
    </nav>
  </header>
</template>
