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

  const sendOtp = async (phoneNumber: string) => {
    loading.value = true
    try {
      const normalized = normalizePhone(phoneNumber)
      await api.post('/otp/request', { phone_number: normalized })
      step.value = 2
      startCooldown(60)
      return { success: true }
    } catch (e: any) {
      return { success: false, message: e?.response?._data?.message ?? 'Gagal mengirim OTP' }
    } finally {
      loading.value = false
    }
  }

  const verifyOtp = async (phoneNumber: string, code: string) => {
    loading.value = true
    try {
      const normalized = normalizePhone(phoneNumber)
      const { data } = await api.post('/otp/verify', { phone_number: normalized, code })
      const token = data?.token
      const user = data?.user
      if (token && user) {
        const auth = useAuthStore()
        auth.setAuth(user, token)
      }
      return { success: true, data }
    } catch (e: any) {
      return { success: false, message: e?.response?._data?.message ?? 'OTP tidak valid' }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    step,
    resendCooldown,
    sendOtp,
    verifyOtp,
  }
}


