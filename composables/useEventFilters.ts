import { computed, ref, watch, type Ref } from 'vue'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'
import type { EventFilterState } from './useEventListing'

export const useEventFilters = (filters: Ref<EventFilterState>) => {
  const defaultYear = new Date().getFullYear()
  const selectedYear = ref(defaultYear)

  watch(
    () => filters.value.year,
    year => {
      selectedYear.value = year ? Number(year) : defaultYear
    },
    { immediate: true }
  )

  const availableYears = computed(() => {
    const currentYear = new Date().getFullYear()
    const years: number[] = []
    for (let i = currentYear - 1; i <= currentYear + 3; i++) {
      years.push(i)
    }
    return years
  })

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

