<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import IconHeroiconsCalendarDays20Solid from '~icons/heroicons/calendar-days-20-solid'
import IconMdiChartDonut from '~icons/mdi/chart-donut'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { useCurrentYear } from '~/composables/useCurrentYear'

const { currentYear: dynamicCurrentYear } = useCurrentYear()

interface Props {
  stats: Record<number, number> // monthIndex (1-12) -> count
  statsByYear?: Record<number, Record<number, number>>
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Kalender Event Lari',
  stats: () => ({}),
  statsByYear: undefined,
})

const currentYear = computed(() => dynamicCurrentYear.value)

const availableYears = computed<number[]>(() => {
  if (props.statsByYear && Object.keys(props.statsByYear).length > 0) {
    return Object.keys(props.statsByYear)
      .map(year => Number(year))
      .sort((a, b) => a - b)
  }
  return [currentYear.value]
})

const selectedYear = ref<number>(currentYear.value)

watch(
  [availableYears, currentYear],
  ([years, current]) => {
    if (years.length === 0) {
      selectedYear.value = current
      return
    }
    if (!years.includes(selectedYear.value)) {
      selectedYear.value = years.includes(current) ? current : years[0]
    }
  },
  { immediate: true },
)

const activeStats = computed<Record<number, number>>(() => {
  if (props.statsByYear && Object.keys(props.statsByYear).length > 0) {
    return props.statsByYear[selectedYear.value] ?? {}
  }
  return props.stats ?? {}
})

const hasEvents = computed(() => Object.values(activeStats.value).some(count => count > 0))

const totalEventsInYear = computed(() => {
  return Object.values(activeStats.value).reduce((sum, count) => sum + count, 0)
})

const calendarGrid = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1 // 1-12
    const date = new Date(selectedYear.value, i, 1)
    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(date)
    const monthShortName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date)
    const eventCount = activeStats.value[monthNum] || 0
    return {
      monthName,
      monthShortName,
      eventCount,
    }
  })
})

const busiestMonth = computed(() => {
  if (!totalEventsInYear.value) return null
  return calendarGrid.value.reduce((busiest, current) => {
    return current.eventCount > busiest.eventCount ? current : busiest
  })
})

const showYearSelector = computed(() => availableYears.value.length > 1)
const yearOptions = computed(() =>
  availableYears.value.map(year => ({
    value: year,
    label: `${year}`,
  })),
)

const selectedYearModel = computed<number>({
  get: () => selectedYear.value,
  set: value => {
    if (typeof value === 'number' && availableYears.value.includes(value)) {
      selectedYear.value = value
    }
  },
})
</script>

<template>
  <section class="bg-white py-10">
    <div class="layout-container">
      <div
        class="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-4"
      >
        <div class="max-w-4xl">
          <span class="badge-modern inline-flex items-center gap-2">
            <IconHeroiconsCalendarDays20Solid class="h-4 w-4" />
            Kalender Event Nasional
          </span>
          <h2
            class="mt-4 text-xl font-bold leading-tight tracking-tighter text-primary lg:text-2xl mb-2"
          >
            {{ title }} {{ selectedYear }}
          </h2>
          <p class="text-sm leading-relaxed text-gray-600 lg:text-base max-w-xl">
            Jelajahi jadwal event lari sepanjang tahun {{ selectedYear }}. Temukan event running di
            bulanmu dan catat race favorit untuk persiapan terbaik.
          </p>
        </div>
        <div class="flex flex-row flex-wrap items-center gap-3 sm:justify-end w-full sm:w-auto">
          <div
            v-if="showYearSelector"
            class="relative flex-1 sm:flex-none sm:w-[200px]"
          >
            <Listbox
              v-model="selectedYearModel"
              as="div"
              class="relative"
            >
              <ListboxButton
                class="relative w-full cursor-default rounded-lg border border-secondary/60 bg-white py-2.5 pl-3 pr-10 text-left text-sm font-medium text-primary focus:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/20"
          >
                <span class="block truncate">{{ selectedYear }}</span>
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <IconHeroiconsArrowRight20Solid class="h-4 w-4 rotate-90 text-gray-400" />
                </span>
              </ListboxButton>
              <transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="translate-y-1 opacity-0"
              >
                <ListboxOptions
                  class="absolute right-0 z-30 mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-secondary/40 focus:outline-none"
                >
                  <ListboxOption
                    v-for="option in yearOptions"
                    :key="option.value"
                    v-slot="{ active, selected }"
                    :value="option.value"
                    as="template"
                  >
                    <li
                      :class="[
                        active ? 'bg-secondary/10 text-primary' : 'text-gray-900',
                        'cursor-pointer select-none px-3 py-2',
                      ]"
                    >
                      <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                        {{ option.label }}
                      </span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </Listbox>
          </div>
          <UiAppButton
            to="/event"
            variant="primary"
            size="sm"
            class="flex-1 sm:flex-none sm:w-auto"
            :icon="IconHeroiconsArrowRight20Solid"
          >
            <span class="hidden sm:inline">Jelajah Semua Event</span>
            <span class="sm:hidden">Semua Event</span>
          </UiAppButton>
        </div>
      </div>

      <div
        v-if="hasEvents"
        class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10"
      >
        <div class="lg:col-span-2">
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <NuxtLink
              v-for="(month, index) in calendarGrid"
              :key="month.monthName"
              :to="`/event?month=${selectedYear}-${String(index + 1).padStart(2, '0')}`"
              class="group flex h-full flex-col justify-between rounded-2xl border p-4 transition-colors duration-200"
              :class="
                month.eventCount > 0
                  ? 'border-secondary bg-surface'
                  : 'border-gray bg-surface/30'
              "
            >
              <div>
                <p
                  class="text-base font-bold tracking-tighter text-primary"
                  :class="{ 'group-hover:text-primary': month.eventCount > 0 }"
                >
                  {{ month.monthName }}
                </p>
              </div>
              <p
                class="mt-3 text-xs font-semibold uppercase tracking-wider"
                :class="[
                  month.eventCount > 0
                    ? 'text-gray-600 group-hover:text-secondary'
                    : 'text-gray-600',
                ]"
              >
                {{ month.eventCount }} Event
              </p>
            </NuxtLink>
          </div>
        </div>
        <div class="lg:col-span-1">
          <div
            class="sticky top-24 flex h-full flex-col rounded-2xl border border-secondary bg-surface p-4"
          >
            <h3 class="flex items-center gap-3 text-lg font-bold text-primary">
              <IconMdiChartDonut class="h-6 w-6 text-secondary" />
              Statistik {{ selectedYear }}
            </h3>
            <div class="mt-4 space-y-4">
              <div
                class="flex items-center justify-between rounded-xl border border-secondary bg-white p-4"
              >
                <p class="text-sm font-medium text-gray-600">
                  Total Event
                </p>
                <p class="text-xl font-bold text-primary">
                  {{ totalEventsInYear }}
                </p>
              </div>
              <div
                v-if="busiestMonth && busiestMonth.eventCount > 0"
                class="flex items-center justify-between rounded-xl border border-secondary bg-white p-4"
              >
                <p class="text-sm font-medium text-gray-600">
                  Bulan Terpadat
                </p>
                <p class="text-right text-base font-bold text-primary">
                  {{ busiestMonth.monthName }}
                  <span class="block text-xs font-normal text-gray-500">{{ busiestMonth.eventCount }} event</span>
                </p>
              </div>
            </div>
            <div class="mt-auto pt-4 text-center">
              <p class="text-xs leading-relaxed text-gray-500">
                Gunakan kalender ini sebagai panduan untuk merencanakan musim larimu.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-2xl border border-dashed border-secondary/40 bg-surface px-6 py-10 text-center text-gray-600"
      >
        <IconHeroiconsCalendarDays20Solid class="mx-auto h-10 w-10 text-gray-500" />
        <p class="mt-4 text-base font-medium">
          Belum ada event terjadwal saat ini.
        </p>
        <p class="mt-1 text-sm">
          Pantau terus halaman ini, kami akan update segera setelah jadwal terbaru dirilis.
        </p>
      </div>
    </div>
  </section>
</template>
