/**
 * Composable untuk fetch FAQ data dari API
 */
import type { FAQ, FAQsResponse, FAQCategoriesResponse } from '~/types/faq'

export const useFAQ = () => {
  const api = useApi()

  /**
   * Fetch semua FAQ dengan filter
   */
  const fetchFAQs = async (options?: {
    category?: string
    keyword?: string
    search?: string
    per_page?: number
    page?: number
  }) => {
    try {
      const response = await api.get<FAQsResponse>('/faqs', {
        params: options,
      })
      return response
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      return {
        success: false,
        message: 'Failed to fetch FAQs',
        data: [],
        meta: { current_page: 1, per_page: 10, total: 0, last_page: 1 },
      } as unknown as FAQsResponse
    }
  }

  /**
   * Fetch FAQ by category
   */
  const fetchFAQsByCategory = async (category: string, per_page = 10) => {
    return fetchFAQs({ category, per_page })
  }

  /**
   * Fetch FAQ categories
   */
  const fetchFAQCategories = async () => {
    try {
      const response = await api.get<FAQCategoriesResponse>('/faqs/categories')
      return response
    } catch (error) {
      console.error('Error fetching FAQ categories:', error)
      return {
        success: false,
        data: [],
      } as unknown as FAQCategoriesResponse
    }
  }

  /**
   * Fetch single FAQ by ID
   */
  const fetchFAQ = async (id: number) => {
    try {
      const response = await api.get<{ success: boolean; data: FAQ }>(`/faqs/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching FAQ:', error)
      return null
    }
  }

  return {
    fetchFAQs,
    fetchFAQsByCategory,
    fetchFAQCategories,
    fetchFAQ,
  }
}
