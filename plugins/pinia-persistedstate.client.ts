import type { Pinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin(nuxtApp => {
  const pinia = nuxtApp.$pinia as Pinia
  pinia.use(
    createPersistedState({
      storage: {
        getItem: (key) => {
          // Use cookie for SSR compatibility
          return useCookie(key, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          }).value
        },
        setItem: (key, value) => {
          useCookie(key, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          }).value = value
        },
        removeItem: (key) => {
          useCookie(key).value = null
        },
      },
    })
  )
})
