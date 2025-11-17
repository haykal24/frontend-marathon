import { useNuxtApp } from '#app'
import { useApiConfig } from './useApiConfig'
import { useAuthStore } from '../stores/auth'
import { $fetch, type FetchOptions } from 'ofetch'

// By default, our API client expects JSON responses.
// We omit `responseType` from the options to prevent conflicts,
// as `$fetch<T>` defaults to JSON parsing.
type JsonFetchOptions = Omit<FetchOptions, 'responseType'>

const resolveAuthStore = () => {
  try {
    return useAuthStore()
  } catch {
    const nuxtApp = useNuxtApp()
    if (nuxtApp?.$pinia) {
      return useAuthStore(nuxtApp.$pinia)
    }

    return null
  }
}

export const useApi = () => {
  const apiConfig = useApiConfig()

  const getHeaders = (body?: BodyInit | Record<string, unknown>) => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    // Don't set Content-Type for FormData - let browser set it automatically with boundary
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const authStore = resolveAuthStore()
    if (authStore?.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    return headers
  }

  const api = {
    get: async <T>(url: string, options?: JsonFetchOptions): Promise<T> => {
      const response = await $fetch<T>(`${apiConfig.baseUrl}${url}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include', // Enable cookies for SSR
        ...options,
      })
      return response
    },

    post: async <T>(
      url: string,
      body?: BodyInit | Record<string, unknown>,
      options?: JsonFetchOptions
    ): Promise<T> => {
      const response = await $fetch<T>(`${apiConfig.baseUrl}${url}`, {
        method: 'POST',
        headers: getHeaders(body),
        body,
        credentials: 'include', // Enable cookies for SSR
        ...options,
      })
      return response
    },

    put: async <T>(
      url: string,
      body?: BodyInit | Record<string, unknown>,
      options?: JsonFetchOptions
    ): Promise<T> => {
      const response = await $fetch<T>(`${apiConfig.baseUrl}${url}`, {
        method: 'PUT',
        headers: getHeaders(),
        body,
        credentials: 'include', // Enable cookies for SSR
        ...options,
      })
      return response
    },

    delete: async <T>(url: string, options?: JsonFetchOptions): Promise<T> => {
      const response = await $fetch<T>(`${apiConfig.baseUrl}${url}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include', // Enable cookies for SSR
        ...options,
      })
      return response
    },
  }

  return api
}
