import type { Pinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin(nuxtApp => {
  const pinia = nuxtApp.$pinia as Pinia
  pinia.use(
    createPersistedState({
      storage: {
        getItem: (key: string): string | null => {
          // Use cookie for SSR compatibility
          const value = useCookie(key, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          }).value
          return value ?? null
        },
        setItem: (key: string, value: string): void => {
          useCookie(key, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          }).value = value
        },
      } as Storage,
    })
  )
})
