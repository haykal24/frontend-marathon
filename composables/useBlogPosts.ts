/**
 * Composable untuk fetch blog posts dari API
 * Pattern: Mengikuti struktur useEvents.ts dengan best practices
 * - Type-safe dengan BlogPost dan BlogPostsResponse
 * - Menggunakan useApi untuk konsistensi
 * - Helper functions untuk use case spesifik (latest, by category, dll)
 */

import type { BlogPost, BlogPostsResponse, BlogCategory } from '~/types/blog'
import { useApi } from './useApi'

export const useBlogPosts = () => {
  const api = useApi()

  /**
   * Fetch blog posts dengan filter lengkap
   * @param params Filter parameters (page, per_page, category, author, search, sort)
   * @returns Promise dengan BlogPostsResponse (data + pagination meta)
   */
  const fetchBlogPosts = async (params?: {
    page?: number
    per_page?: number
    category?: string // slug atau ID
    tag?: string
    author?: string
    search?: string
    sort?: 'latest' | 'popular' | 'trending'
  }): Promise<BlogPostsResponse> => {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params?.category) queryParams.append('category', params.category)
    if (params?.author) queryParams.append('author', params.author)
    if (params?.tag) queryParams.append('tag', params.tag)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sort) queryParams.append('sort', params.sort)

    const query = queryParams.toString()
    const url = `/blog/posts${query ? `?${query}` : ''}`

    return await api.get<BlogPostsResponse>(url)
  }

  /**
   * Fetch latest blog posts (untuk homepage / section)
   * @param limit Jumlah artikel yang ingin diambil (default 6)
   * @returns Promise dengan BlogPostsResponse
   */
  const fetchLatestBlogPosts = async (limit: number = 6): Promise<BlogPostsResponse> => {
    return await fetchBlogPosts({
      per_page: limit,
      sort: 'latest',
    })
  }

  /**
   * Fetch blog posts by category (untuk halaman kategori)
   * @param category Category slug
   * @param limit Jumlah artikel (default 12)
   * @returns Promise dengan BlogPostsResponse
   */
  const fetchBlogPostsByCategory = async (
    category: string,
    limit: number = 12
  ): Promise<BlogPostsResponse> => {
    return await fetchBlogPosts({
      category,
      per_page: limit,
      sort: 'latest',
    })
  }

  /**
   * Fetch blog post by slug (untuk halaman detail)
   * @param slug Post slug
   * @returns Promise dengan single BlogPost data
   */
  const fetchBlogPostBySlug = async (slug: string): Promise<{ data: BlogPost }> => {
    return await api.get<{ data: BlogPost }>(`/blog/posts/${slug}`)
  }

  /**
   * Fetch blog categories (untuk filter sidebar)
   * @returns Promise dengan array BlogCategory
   */
  const fetchBlogCategories = async (): Promise<{ data: BlogCategory[] }> => {
    return await api.get<{ data: BlogCategory[] }>('/blog/categories')
  }

  /**
   * Search blog posts (untuk search functionality)
   * @param query Search term
   * @param limit Jumlah hasil (default 20)
   * @returns Promise dengan BlogPostsResponse
   */
  const searchBlogPosts = async (query: string, limit: number = 20): Promise<BlogPostsResponse> => {
    return await fetchBlogPosts({
      search: query,
      per_page: limit,
      sort: 'latest',
    })
  }

  return {
    fetchBlogPosts,
    fetchLatestBlogPosts,
    fetchBlogPostsByCategory,
    fetchBlogPostBySlug,
    fetchBlogCategories,
    searchBlogPosts,
  }
}
