import { defineStore } from 'pinia'
import { useApi } from '../composables/useApi'

interface User {
  id: number
  name: string | null
  phone_number: string
  email: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),

  getters: {
    getUser: state => state.user,
    getToken: state => state.token,
    isLoggedIn: state => state.isAuthenticated && !!state.token,
  },

  actions: {
    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
      this.isAuthenticated = true
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
    },

    async requestOtp(phoneNumber: string) {
      const api = useApi()
      const response = await api.post<{
        success: boolean
        message: string
        debug?: { otp: string; phone: string }
      }>('/otp/request', {
        phone_number: phoneNumber,
      })

      return response
    },

    async verifyOtp(phoneNumber: string, code: string) {
      const api = useApi()
      const response = await api.post<{
        success: boolean
        message: string
        data: {
          user: User
          token: string
          token_type: string
        }
      }>('/otp/verify', {
        phone_number: phoneNumber,
        code,
      })

      if (response.success && response.data) {
        this.setAuth(response.data.user, response.data.token)
      }

      return response
    },

    async logout() {
      this.clearAuth()
      // Navigate only on client side
      if (typeof window !== 'undefined') {
        await navigateTo('/')
      }
    },
  },

  persist: true,
})
