<script setup lang="ts">
import { computed } from 'vue'
import IconHeroiconsArrowRight20Solid from '~icons/heroicons/arrow-right-20-solid'
import { useCurrentYear } from '~/composables/useCurrentYear'

const { currentYear: dynamicCurrentYear } = useCurrentYear()

interface Props {
  stats: Record<number, number> // monthIndex (1-12) -> count
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Kalender Event Lari',
  stats: () => ({}),
})

const currentYear = computed(() => dynamicCurrentYear.value)

const hasEvents = computed(() => Object.values(props.stats).some(count => count > 0))

const totalEventsInYear = computed(() => {
  return Object.values(props.stats).reduce((sum, count) => sum + count, 0)
})

const calendarGrid = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1 // 1-12
    const date = new Date(currentYear.value, i, 1)
    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(date)
    const monthShortName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date)
    const eventCount = props.stats[monthNum] || 0
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
            {{ title }} {{ currentYear }}
          </h2>
          <p class="text-sm leading-relaxed text-gray-600 lg:text-base">
            Jelajahi jadwal event lari sepanjang tahun {{ currentYear }}. Temukan event running di
            bulanmu dan catat race favorit untuk persiapan terbaik.
          </p>
        </div>
        <UiAppButton
          to="/event"
          variant="primary"
          size="sm"
          class="self-start shrink-0 lg:w-auto"
          :icon="IconHeroiconsArrowRight20Solid"
        >
          Jelajah Semua Event
        </UiAppButton>
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
              :to="`/event?month=${currentYear}-${String(index + 1).padStart(2, '0')}`"
              class="group flex h-full flex-col justify-between rounded-2xl border p-4 transition-colors duration-200"
              :class="
                month.eventCount > 0
                  ? 'border-secondary bg-surface'
                  : 'border-secondary/40 bg-gray-100/70'
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
                    ? 'text-gray-500 group-hover:text-secondary'
                    : 'text-gray-400',
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
              Statistik {{ currentYear }}
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
        class="rounded-2xl border border-dashed border-secondary/40 bg-surface px-6 py-10 text-center text-gray-500"
      >
        <IconHeroiconsCalendarDays20Solid class="mx-auto h-10 w-10 text-gray-400" />
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
