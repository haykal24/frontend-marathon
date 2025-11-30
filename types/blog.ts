/**
 * Type definitions untuk Blog
 */

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  banner?: string | null
  content?: string | null
  published_at?: string | null
  author?: BlogAuthor
  category?: BlogCategory
  tags?: BlogTag[]
  seo_title?: string | null
  seo_description?: string | null
  created_at: string
  updated_at: string
}

export interface BlogAuthor {
  id: number
  name: string
  email: string
  photo?: string | null
  bio?: string | null
}

export interface BlogCategory {
  id: number
  name: string
  slug: string
  description?: string | null
}

export interface BlogTag {
  id: number
  name: string
  slug: string
}

export interface BlogPostsResponse {
  success: boolean
  message: string
  data: BlogPost[]
  meta: {
    pagination: {
      current_page: number
      last_page: number
      per_page: number
      total: number
      from?: number
      to?: number
      has_more_pages?: boolean
      path?: string
      links?: {
        first: string
        last: string
        prev: string | null
        next: string | null
      }
    }
  }
}
