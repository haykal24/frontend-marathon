import { computed } from 'vue'

/**
 * Composable untuk mendapatkan tahun saat ini secara otomatis
 * Digunakan untuk SEO copywriting dan dynamic content
 *
 * @example
 * const { currentYear } = useCurrentYear()
 * // currentYear = 2025
 */
export const useCurrentYear = () => {
  const currentYear = computed(() => new Date().getFullYear())

  return {
    currentYear,
  }
}
