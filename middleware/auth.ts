import { useAuthStore } from '../stores/auth'

// defineNuxtRouteMiddleware and navigateTo are auto-imported by Nuxt
export default defineNuxtRouteMiddleware(to => {
  const authStore = useAuthStore()

  // Auth akan otomatis di-load dari localStorage via pinia-plugin-persistedstate
  // Tidak perlu manual loadAuth() lagi

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    navigateTo('/login')
    return
  }

  // Redirect authenticated users away from login page
  if (to.path === '/login' && authStore.isLoggedIn) {
    navigateTo('/')
    return
  }
})
