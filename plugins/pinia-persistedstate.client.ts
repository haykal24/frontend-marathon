import type { Pinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin(nuxtApp => {
  const pinia = nuxtApp.$pinia as Pinia
  pinia.use(createPersistedState())
})
