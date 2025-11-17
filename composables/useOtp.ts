import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

export const useOtp = () => {
  const api = useApi()
  const loading = ref(false)
  const step = ref<1 | 2>(1)
  const resendCooldown = ref(0)
  let timer: number | null = null

  const normalizePhone = (input: string): string => {
    const digits = (input || '').replace(/\D/g, '')
    if (!digits) return ''
    if (digits.startsWith('62')) return digits
    if (digits.startsWith('0')) return `62${digits.slice(1)}`
    return `62${digits}`
  }

  const startCooldown = (seconds = 60) => {
    resendCooldown.value = seconds
    if (timer) window.clearInterval(timer)
    timer = window.setInterval(() => {
      resendCooldown.value -= 1
      if (resendCooldown.value <= 0 && timer) {
        window.clearInterval(timer)
        timer = null
      }
    }, 1000)
  }

  const checkPhone = async (phoneNumber: string) => {
    loading.value = true
    try {
      const normalized = normalizePhone(phoneNumber)
      const response = await api.post<{ data?: { user_exists?: boolean } }>('/otp/check-phone', { phone_number: normalized })
      return { 
        success: true, 
        user_exists: response?.data?.user_exists ?? false,
      }
    } catch (e: unknown) {
      const error = e as { response?: { _data?: { message?: string } } }
      return { success: false, message: error?.response?._data?.message ?? 'Gagal memeriksa nomor' }
    } finally {
      loading.value = false
    }
  }

  const sendOtp = async (phoneNumber: string) => {
    loading.value = true
    try {
      const normalized = normalizePhone(phoneNumber)
      await api.post('/otp/request', { phone_number: normalized })
      step.value = 2
      startCooldown(60)
      return { 
        success: true,
      }
    } catch (e: unknown) {
      const error = e as { response?: { _data?: { message?: string } } }
      return { success: false, message: error?.response?._data?.message ?? 'Gagal mengirim OTP' }
    } finally {
      loading.value = false
    }
  }

  const verifyOtp = async (phoneNumber: string, code: string, name?: string, email?: string | null) => {
    loading.value = true
    try {
      const normalized = normalizePhone(phoneNumber)
      const payload: { phone_number: string; code: string; name?: string; email?: string | null } = { 
        phone_number: normalized, 
        code,
      }
      
      // Include name and email if provided (for registration flow)
      if (name?.trim()) {
        payload.name = name.trim()
      }
      if (email?.trim()) {
        payload.email = email.trim()
      }
      
      const response = await api.post<{ data?: { token?: string; user?: { id: number; name?: string; phone_number: string; email?: string | null } } }>('/otp/verify', payload)
      const token = response?.data?.token
      const userData = response?.data?.user
      if (token && userData) {
        const auth = useAuthStore()
        // Ensure user has required fields
        const user = {
          id: userData.id,
          name: userData.name ?? '',
          phone_number: userData.phone_number,
          email: userData.email ?? null,
        }
        auth.setAuth(user, token)
        
        // Wait for Pinia persist to sync to cookies (SSR-safe)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return { success: true, data: response?.data }
    } catch (e: unknown) {
      const error = e as { response?: { _data?: { message?: string } } }
      return { success: false, message: error?.response?._data?.message ?? 'OTP tidak valid' }
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (name: string, email?: string | null) => {
    loading.value = true
    try {
      const response = await api.put('/me', {
        name: name.trim(),
        email: email?.trim() || null,
      })
      
      // Update local auth store
      const auth = useAuthStore()
      if (auth.user) {
        auth.user.name = name.trim()
        auth.user.email = email?.trim() || null
      }
      
      return { success: true, data: response }
    } catch (e: unknown) {
      const error = e as { response?: { _data?: { message?: string } } }
      return { success: false, message: error?.response?._data?.message ?? 'Gagal memperbarui profil' }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    step,
    resendCooldown,
    checkPhone,
    sendOtp,
    verifyOtp,
    updateProfile,
  }
}


