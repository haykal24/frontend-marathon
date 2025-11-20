<script setup lang="ts">
import { computed } from 'vue'
import IconMdiChevronRight from '~icons/mdi/chevron-right'
import IconMdiHome from '~icons/mdi/home'

export interface BreadcrumbItem {
  text: string
  link?: string | null
}

interface Props {
  items?: BreadcrumbItem[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
})

type BreadcrumbItemInternal = {
  text: string
  link: string | null
  isCurrent: boolean
  isEllipsis?: boolean
}

const breadcrumbs = computed<BreadcrumbItemInternal[]>(() => {
  const breadcrumbItems: BreadcrumbItemInternal[] = [
    { text: 'Home', link: '/', isCurrent: false },
  ]

  if (props.items && props.items.length > 0) {
    props.items.forEach((item, index) => {
      const isLast = index === props.items!.length - 1
      breadcrumbItems.push({
        text: item.text,
        link: isLast ? null : item.link || null,
        isCurrent: isLast,
      })
    })
  }

  return breadcrumbItems
})

// Smart breadcrumb untuk mobile: hanya tampilkan home, skip tengah, dan current
const mobileBreadcrumbs = computed<BreadcrumbItemInternal[]>(() => {
  const allBreadcrumbs = breadcrumbs.value
  if (allBreadcrumbs.length <= 3) {
    return allBreadcrumbs
  }
  // Di mobile, hanya tampilkan: Home ... Current
  const firstItem = allBreadcrumbs[0]
  const lastItem = allBreadcrumbs[allBreadcrumbs.length - 1]
  if (!firstItem || !lastItem) {
    return allBreadcrumbs
  }
  return [
    firstItem,
    { text: '...', link: null, isCurrent: false, isEllipsis: true },
    lastItem,
  ]
})
</script>

<template>
  <div class="breadcrumb-container">
    <nav
      class="layout-container py-3"
      aria-label="Breadcrumb"
    >
      <!-- Desktop: Full breadcrumb -->
      <ol class="hidden md:flex items-center gap-1 sm:gap-2 text-xs lg:text-sm min-w-0">
        <li
          v-for="(item, index) in breadcrumbs"
          :key="index"
          class="flex items-center gap-1 sm:gap-2 min-w-0"
        >
          <!-- Home icon for first item -->
          <template v-if="index === 0">
            <NuxtLink
              :to="item.link || '/'"
              class="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-primary transition-colors duration-200 flex-shrink-0 leading-none"
              :aria-current="item.isCurrent ? 'page' : undefined"
            >
              <IconMdiHome class="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
              <span class="hidden lg:inline leading-none">{{ item.text }}</span>
              <span class="inline lg:hidden leading-none">Home</span>
            </NuxtLink>
          </template>

          <!-- Subsequent items -->
          <template v-else>
            <div class="flex items-center gap-1 sm:gap-2 min-w-0">
              <IconMdiChevronRight class="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
              <NuxtLink
                v-if="item.link && !item.isCurrent"
                :to="item.link"
                class="text-gray-600 hover:text-primary transition-colors duration-200 truncate max-w-[200px] lg:max-w-none"
              >
                {{ item.text }}
              </NuxtLink>
              <span
                v-else
                class="text-secondary font-medium truncate max-w-[200px] lg:max-w-none"
                :class="{ 'text-gray-600': !item.isCurrent }"
                :aria-current="item.isCurrent ? 'page' : undefined"
              >
                {{ item.text }}
              </span>
            </div>
          </template>
        </li>
      </ol>

      <!-- Mobile: Simplified breadcrumb with truncate -->
      <ol class="flex md:hidden items-center gap-1 text-xs min-w-0 overflow-hidden">
        <li
          v-for="(item, index) in mobileBreadcrumbs"
          :key="index"
          class="flex items-center gap-1 min-w-0 flex-shrink-0"
        >
          <!-- Home icon for first item -->
          <template v-if="index === 0">
            <NuxtLink
              :to="item.link || '/'"
              class="flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors duration-200 flex-shrink-0 leading-none"
              :aria-current="item.isCurrent ? 'page' : undefined"
            >
              <IconMdiHome class="h-4 w-4 flex-shrink-0" />
            </NuxtLink>
          </template>

          <!-- Ellipsis for skipped items -->
          <template v-else-if="item.isEllipsis">
            <div class="flex items-center gap-1 min-w-0">
              <IconMdiChevronRight class="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span class="text-gray-400 px-1">...</span>
            </div>
          </template>

          <!-- Subsequent items -->
          <template v-else>
            <div class="flex items-center gap-1 min-w-0">
              <IconMdiChevronRight class="h-3 w-3 text-gray-400 flex-shrink-0" />
              <NuxtLink
                v-if="item.link && !item.isCurrent"
                :to="item.link"
                class="text-gray-600 hover:text-primary transition-colors duration-200 truncate max-w-[120px]"
              >
                {{ item.text }}
              </NuxtLink>
              <span
                v-else
                class="text-secondary font-medium truncate max-w-[140px]"
                :class="{ 'text-gray-600': !item.isCurrent }"
                :aria-current="item.isCurrent ? 'page' : undefined"
              >
                {{ item.text }}
              </span>
            </div>
          </template>
        </li>
      </ol>
    </nav>
  </div>
</template>
