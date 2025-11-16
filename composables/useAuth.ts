export const useAuth = () => {
  const authStore = useAuthStore()

  // Auth akan otomatis di-load dari localStorage via pinia-plugin-persistedstate

  return {
    user: computed(() => authStore.getUser),
    token: computed(() => authStore.getToken),
    isAuthenticated: computed(() => authStore.isLoggedIn),
    requestOtp: authStore.requestOtp,
    verifyOtp: authStore.verifyOtp,
    logout: authStore.logout,
  }
}
