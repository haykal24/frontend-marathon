import { useAsyncData } from '#app'
import { computed, ref, watch, type Ref } from 'vue'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'
import type { EventFilterState } from './useEventListing'
import { useEvents } from './useEvents'

const buildFallbackYears = (currentYear: number) => {
  const years: number[] = []
  for (let year = currentYear - 1; year <= currentYear + 3; year++) {
    years.push(year)
  }
  return years
}

export const useEventFilters = async (filters: Ref<EventFilterState>) => {
  const defaultYear = new Date().getFullYear()
  const selectedYear = ref(defaultYear)
  const availableYears = ref<number[]>(buildFallbackYears(defaultYear))
  const { fetchAvailableEventYears } = useEvents()

  const normalizeYears = (years?: number[] | null) => {
    if (!Array.isArray(years) || years.length === 0) {
      return buildFallbackYears(defaultYear)
    }

    return Array.from(
      new Set(
        years
          .map(year => Number(year))
          .filter(year => !Number.isNaN(year)),
      ),
    ).sort((a, b) => b - a)
  }

  const { data: availableYearsData } = await useAsyncData('event-available-years', async () => {
    const response = await fetchAvailableEventYears()
    return response.years
  })

  const applyAvailableYears = (years?: number[] | null) => {
    const normalizedYears = normalizeYears(years)
    availableYears.value = normalizedYears

    if (!normalizedYears.includes(selectedYear.value)) {
      const fallbackYear = normalizedYears.includes(defaultYear)
        ? defaultYear
        : normalizedYears[0]
      selectedYear.value = fallbackYear
      filters.value.year = String(fallbackYear)
    }
  }

  watch(
    () => availableYearsData.value,
    years => {
      applyAvailableYears(years)
    },
    { immediate: true },
  )

  watch(
    () => filters.value.year,
    year => {
      selectedYear.value = year ? Number(year) : defaultYear
    },
    { immediate: true }
  )

  const monthOptions = computed(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(selectedYear.value, index, 1)
      return {
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM', { locale: id }),
      }
    })
  })

  const handleYearSelect = (year: number) => {
    selectedYear.value = year
    filters.value.year = String(year)
    filters.value.month = ''
  }

  const handleMonthSelect = (monthValue: string, close?: () => void) => {
    if (filters.value.month === monthValue) {
      filters.value.month = ''
    } else {
      filters.value.month = monthValue
      const yearFromMonth = Number(monthValue.split('-')[0])
      if (!Number.isNaN(yearFromMonth)) {
        filters.value.year = String(yearFromMonth)
        selectedYear.value = yearFromMonth
      }
    }

    close?.()
  }

  return {
    selectedYear,
    availableYears,
    monthOptions,
    handleYearSelect,
    handleMonthSelect,
  }
}

