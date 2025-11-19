/**
 * Type definitions untuk Event
 */

export interface Event {
  id: number
  title: string
  slug: string
  description: string
  image?: string | null
  poster_webp_url?: string | null // WebP optimized image from media library
  location_name: string
  city: string
  province?: string | null
  event_date: string
  event_end_date?: string | null
  event_type: string
  registration_url?: string | null
  organizer_name?: string | null
  is_featured?: boolean // Badge "Event Pilihan" di event cards & listing
  is_featured_hero?: boolean // Featured di hero slider homepage (via /events/featured-hero endpoint)
  featured_hero_expires_at?: string | null
  benefits?: string[]
  contact_info?: Record<string, string | string[]>
  registration_fees?: Record<string, string>
  social_media?: Record<string, string | string[]>
  status: 'draft' | 'pending_review' | 'published'
  seo_title?: string | null
  seo_description?: string | null
  categories?: EventCategory[] | string[]
  category_names?: string[]
  created_at: string
  updated_at: string
}

export interface EventCategory {
  id: number
  name: string
  slug: string
}

export interface EventType {
  id: number
  name: string
  slug: string
  description?: string | null
  image?: string | null
  is_active: boolean
  event_count?: number
  created_at: string
  updated_at: string
}

export interface Province {
  id: number
  name: string
  slug: string
  thumbnail?: string | null
  description?: string | null
  is_active: boolean
  is_featured_frontend?: boolean
  event_count?: number
  created_at: string
  updated_at: string
}

export interface EventsResponse {
  success: boolean
  message: string
  data: Event[]
  meta: {
    pagination: {
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
      has_more_pages: boolean
      path: string
      links: {
        first: string
        last: string
        prev: string | null
        next: string | null
      }
    }
  }
}
