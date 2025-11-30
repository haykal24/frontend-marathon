export interface GalleryImage {
  id: number
  url: string
  thumb_url: string
  name: string
}

export interface RunningCommunity {
  id: number
  name: string
  slug?: string
  location?: string | null
  city?: string | null
  instagram_handle?: string | null
  contact_info?: string | null
  logo_url?: string | null
  is_featured: boolean
  phone?: string | null
  email?: string | null
  gallery?: GalleryImage[]
  created_at?: string
  updated_at?: string
}

export interface Vendor {
  id: number
  name: string
  slug?: string
  type: string
  type_raw?: string
  description?: string | null
  city?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  is_featured: boolean
  logo?: string | null
  logo_url?: string | null
  gallery?: GalleryImage[]
  created_at?: string
  updated_at?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
    [key: string]: unknown
    pagination?: {
      current_page?: number
      last_page?: number
      per_page?: number
      total?: number
      [key: string]: unknown
    }
  }
}

export type EcosystemQuery = Record<string, string | number | boolean | undefined>
