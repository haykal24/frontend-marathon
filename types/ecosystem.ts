export interface RunningCommunity {
  id: number
  name: string
  location?: string | null
  instagram_handle?: string | null
  contact_info?: string | null
  logo_url?: string | null
  is_featured: boolean
  phone?: string | null
  email?: string | null
  created_at?: string
  updated_at?: string
}

export interface Vendor {
  id: number
  name: string
  type: string
  description?: string | null
  city?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  is_featured: boolean
  logo_url?: string | null
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
