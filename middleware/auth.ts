import { useAuthStore } from '../stores/auth'

// defineNuxtRouteMiddleware and navigateTo are auto-imported by Nuxt
export default defineNuxtRouteMiddleware(to => {
  // For SSR compatibility, check auth cookie directly
  const authCookie = useCookie('auth')
  const authStore = useAuthStore()

  // Parse auth from cookie (for SSR & client refresh)
  let isAuthenticated = false
  if (authCookie.value) {
    try {
      const authData = typeof authCookie.value === 'string' 
        ? JSON.parse(authCookie.value) 
        : authCookie.value
      
      isAuthenticated = authData?.isAuthenticated && !!authData?.token
      
      // Sync cookie to store if not already synced (for SSR)
      if (isAuthenticated && !authStore.isLoggedIn) {
        authStore.setAuth(authData.user, authData.token)
      }
    } catch {
      isAuthenticated = false
    }
  }

  // Check if route requires authentication (applies to pages with middleware: ['auth'])
  if (!isAuthenticated) {
    // Redirect to login with next parameter for post-login redirect
    return navigateTo({
      path: '/login',
      query: { next: to.fullPath },
    })
  }

  // Redirect authenticated users away from login page
  if (to.path === '/login' && isAuthenticated) {
    // If there's a next parameter, redirect to it, otherwise go to dashboard
    const next = to.query.next as string | undefined
    return navigateTo(next || '/mitra/dashboard')
  }
})
