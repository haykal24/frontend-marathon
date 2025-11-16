/**
 * FAQ Types
 */

export interface FAQ {
  id: number
  category: string
  keyword?: string | null
  question: string
  answer: string
  sort_order: number
  is_active: boolean
  views: number
  related_keyword?: string | null
  created_at: string
  updated_at: string
}

export interface FAQsResponse {
  success: boolean
  message: string
  data: FAQ[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface FAQCategoriesResponse {
  success: boolean
  data: string[]
}
