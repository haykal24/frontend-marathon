import { ref, watch, type Ref } from 'vue'
import type { Event } from '~/types/event'
import { useEvents } from '~/composables/useEvents'

export type SortOption = 'latest' | 'featured'

export interface EventFilterState {
  search: string
  month: string
  province: string[] | string
  type: string[] | string
  sort: SortOption
  year: string
}

interface LoadOptions {
  append?: boolean
}

export const useEventListing = (filters: Ref<EventFilterState>) => {
  const { fetchEvents } = useEvents()

  const events = ref<Event[]>([])
  const pending = ref(false)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const totalCount = ref(0)

  const buildRequestPayload = (page: number) => {
    const filterValue = filters.value

    const typeValue = Array.isArray(filterValue.type)
      ? filterValue.type[0]
      : filterValue.type
    const provinceValue = Array.isArray(filterValue.province)
      ? filterValue.province[0]
      : filterValue.province
    const sortValue: SortOption = filterValue.sort ?? 'latest'

    return {
      page,
      per_page: 12,
      sort: sortValue,
      order_by: 'event_date',
      order: 'desc' as const,
      status: 'published' as const,
      search: filterValue.search || undefined,
      month: filterValue.month || undefined,
      year: filterValue.year || undefined,
      province: provinceValue || undefined,
      type: typeValue || undefined,
    }
  }

  const loadEvents = async (page = 1, options: LoadOptions = {}) => {
    pending.value = true
    try {
      const response = await fetchEvents(buildRequestPayload(page))

      if (options.append && page !== 1) {
        events.value = [...events.value, ...response.data]
      } else {
        events.value = response.data
      }

      currentPage.value = response.meta.pagination.current_page
      lastPage.value = response.meta.pagination.last_page
      totalCount.value = response.meta.pagination.total
    } finally {
      pending.value = false
    }
  }

  const loadMore = () => {
    if (currentPage.value >= lastPage.value || pending.value) {
      return
    }
    return loadEvents(currentPage.value + 1, { append: true })
  }

  const reload = () => loadEvents(1)

  watch(
    filters,
    () => {
      reload()
    },
    { deep: true, immediate: true }
  )

  return {
    events,
    pending,
    currentPage,
    lastPage,
    totalCount,
    loadMore,
    reload,
    loadEvents,
  }
}

