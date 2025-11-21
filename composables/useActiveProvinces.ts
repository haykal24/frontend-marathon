import { computed } from 'vue'
import { useProvinces } from './useProvinces'
import { useAsyncData } from '#app'

export const useActiveProvinces = async () => {
  const { fetchActiveProvinces } = useProvinces()

  const { data, refresh } = await useAsyncData(
    'event-listing-provinces',
    () => fetchActiveProvinces(),
    {
      lazy: false,
      server: true,
      default: () => ({ data: [] }),
    }
  )

  const provinces = computed(() => {
    const raw = data.value?.data
    if (!raw || !Array.isArray(raw)) {
      return []
    }
    return raw
  })

  return {
    provinces,
    refreshProvinces: refresh,
  }
}

