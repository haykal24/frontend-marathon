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

const breadcrumbs = computed(() => {
  const breadcrumbItems: Array<{ text: string; link: string | null; isCurrent: boolean }> = [
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
</script>

<template>
  <div class="breadcrumb-container">
    <nav
      class="layout-container py-3"
      aria-label="Breadcrumb"
    >
      <ol class="flex items-center gap-1 sm:gap-2 text-xs lg:text-sm min-w-0">
        <li
          v-for="(item, index) in breadcrumbs"
          :key="index"
          class="flex items-center gap-1 sm:gap-2 min-w-0"
        >
          <!-- Home icon for first item -->
          <template v-if="index === 0">
            <NuxtLink
              :to="item.link || '/'"
              class="flex items-center gap-1 sm:gap-1.5 text-gray-600 hover:text-primary transition-colors duration-200 flex-shrink-0"
              :aria-current="item.isCurrent ? 'page' : undefined"
            >
              <IconMdiHome class="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
              <span class="hidden lg:inline">{{ item.text }}</span>
              <span class="inline lg:hidden">Home</span>
            </NuxtLink>
          </template>

          <!-- Subsequent items -->
          <template v-else>
            <div class="flex items-center gap-1 sm:gap-2 min-w-0">
              <IconMdiChevronRight class="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
              <NuxtLink
                v-if="item.link && !item.isCurrent"
                :to="item.link"
                class="text-gray-600 hover:text-primary transition-colors duration-200 truncate"
              >
                {{ item.text }}
              </NuxtLink>
              <span
                v-else
                class="text-secondary font-medium truncate"
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
