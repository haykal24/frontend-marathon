/**
 * Composable untuk generate BreadcrumbList Schema.org markup
 * Sesuai dengan Google's Breadcrumb rich results requirements
 * 
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue, watch } from 'vue'
import type { BreadcrumbItem } from '~/components/layout/Breadcrumb.vue'

export const useBreadcrumbSchema = (items: MaybeRefOrGetter<BreadcrumbItem[]>) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'http://localhost:3000'

  // Build breadcrumb list dengan Home sebagai item pertama (reactive)
  const breadcrumbList = computed(() => {
    const breadcrumbItems = toValue(items)
    
    return [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      ...breadcrumbItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.text,
        item: item.link ? `${siteUrl}${item.link}` : undefined,
      })),
    ]
  })

  // Filter out items tanpa URL (current page) - computed untuk reactivity
  const validBreadcrumbs = computed(() =>
    breadcrumbList.value.filter(
      (item): item is typeof item & { item: string } => !!item.item
    )
  )

  // Only add schema if we have at least 2 items (Home + at least one other)
  // useSchemaOrg supports computed values, so we can pass computed directly
  // Watch for changes and update schema reactively
  watch(
    validBreadcrumbs,
    (breadcrumbs) => {
      if (breadcrumbs.length >= 2) {
        useSchemaOrg([
          {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs,
          },
        ])
      }
    },
    { immediate: true }
  )
}

