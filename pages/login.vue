<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from '#app'
import { useOtp } from '~/composables/useOtp'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useSiteSettings } from '~/composables/useSiteSettings'
import IconHeroiconsArrowLeft20Solid from '~icons/heroicons/arrow-left-20-solid'
import IconHeroiconsDevicePhoneMobile20Solid from '~icons/heroicons/device-phone-mobile-20-solid'
import IconHeroiconsUserPlus20Solid from '~icons/heroicons/user-plus-20-solid'

definePageMeta({
  layout: 'auth',
})

useSeoMetaDynamic({
  title: 'Login - indonesiamarathon.com',
  description: 'Masuk dengan WhatsApp OTP untuk mengirim event (EO) dan mengakses fitur lainnya.',
  url: '/login',
})

const route = useRoute()
const phone = ref('')
const code = ref('')
const name = ref('')
const email = ref('')
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const { loading, step, resendCooldown, checkPhone, sendOtp, verifyOtp } = useOtp()
const siteSettings = useSiteSettings()
const activeTab = ref<'login' | 'register'>(
  (route.query.tab === 'register' ? 'register' : 'login') as 'login' | 'register'
)

const authImage = computed(() =>
  siteSettings.getImage(
    'auth_image',
    siteSettings.getImage('auth_login_image', siteSettings.getImage('header_bg_static', null))
  )
)

const logo = computed(() => siteSettings.getImage('logo', null) ?? '/logo.png')

const onSend = async () => {
  errorMessage.value = null
  successMessage.value = null
  if (!phone.value) return
  
  // Step 1: Check if phone is registered
  const checkRes = await checkPhone(phone.value)
  if (!checkRes.success) {
    errorMessage.value = checkRes.message || 'Gagal memeriksa nomor'
    return
  }
  
  // If not registered, redirect to register tab (don't send OTP)
  if (!checkRes.user_exists) {
    activeTab.value = 'register'
    errorMessage.value = 'Nomor belum terdaftar. Silakan daftar terlebih dahulu dengan mengisi data di bawah.'
    step.value = 1
    return
  }
  
  // Step 2: User registered, send OTP
  const otpRes = await sendOtp(phone.value)
  if (!otpRes.success) {
    errorMessage.value = otpRes.message || 'Gagal mengirim OTP'
  } else {
    successMessage.value = 'Kode OTP telah dikirim ke WhatsApp Anda'
    step.value = 2
  }
}

const onSubmitRegister = async () => {
  errorMessage.value = null
  successMessage.value = null
  
  // Step 1: Validate inputs
  if (!phone.value) {
    errorMessage.value = 'Nomor WhatsApp wajib diisi'
    return
  }
  if (!name.value.trim()) {
    errorMessage.value = 'Nama Lengkap wajib diisi untuk pendaftaran'
    return
  }
  
  // Step 2: Check if phone already registered
  const checkRes = await checkPhone(phone.value)
  if (!checkRes.success) {
    errorMessage.value = checkRes.message || 'Gagal memeriksa nomor'
    return
  }
  
  // If already registered, redirect to login
  if (checkRes.user_exists) {
    errorMessage.value = 'Nomor sudah terdaftar. Silakan gunakan tab Login untuk masuk.'
    activeTab.value = 'login'
    step.value = 1
    return
  }
  
  // Step 3: Send OTP for registration
  const otpRes = await sendOtp(phone.value)
  if (!otpRes.success) {
    errorMessage.value = otpRes.message || 'Gagal mengirim OTP'
    return
  }
  
  // Move to OTP verification step
  successMessage.value = 'Kode OTP telah dikirim ke WhatsApp Anda. Silakan verifikasi.'
}

const onVerifyAndRegister = async () => {
  errorMessage.value = null
  successMessage.value = null
  
  // Verify OTP with name and email (for register tab)
  if (!phone.value || !code.value) {
    errorMessage.value = 'Nomor WhatsApp dan kode OTP wajib diisi'
    return
  }
  
  // Pass name and email to verifyOtp for registration
  const res = await verifyOtp(
    phone.value, 
    code.value,
    activeTab.value === 'register' ? name.value : undefined,
    activeTab.value === 'register' ? email.value : undefined
  )
  
  if (!res.success) {
    errorMessage.value = res.message || 'OTP tidak valid'
    return
  }
  
  // Success message based on tab
  if (activeTab.value === 'register') {
    successMessage.value = 'Registrasi berhasil! Mengalihkan ke dashboard...'
  } else {
    successMessage.value = 'Login berhasil! Mengalihkan...'
  }
  
  // Redirect immediately (auth store already synced)
  await nextTick()
  const next = route.query.next as string | undefined
  await navigateTo(next || '/mitra/dashboard')
}

const onVerifyLogin = async () => {
  errorMessage.value = null
  successMessage.value = null
  
  if (!phone.value || !code.value) return
  const res = await verifyOtp(phone.value, code.value)
  if (res.success) {
    successMessage.value = 'Login berhasil! Mengalihkan...'
    
    // Redirect immediately (auth store already synced)
    await nextTick()
    const next = route.query.next as string | undefined
    await navigateTo(next || '/mitra/dashboard')
  } else {
    errorMessage.value = res.message || 'OTP tidak valid'
  }
}
</script>

<template>
  <div class="layout-container h-screen py-6">
    <div class="mx-auto w-full max-w-7xl h-full">
      <!-- Unified container: image + form merged, no gaps -->
      <div class="h-full overflow-hidden rounded-2xl border border-secondary/20">
        <div class="grid grid-cols-1 lg:grid-cols-2 h-full min-h-0">
          <!-- Left: Image (neutral surface, scrollable when overflow) -->
          <div class="relative hidden lg:block min-h-0 overflow-y-auto">
            <NuxtImg
              v-if="authImage"
              :src="authImage"
              alt="Auth Illustration"
              class="h-full w-full object-cover"
              format="webp"
              sizes="50vw"
              preload
              loading="eager"
              fetch-priority="high"
              width="960"
              height="1080"
              densities="x1"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-primary/70 bg-white"
            >
              <div class="text-center">
                <IconHeroiconsDevicePhoneMobile20Solid class="mx-auto mb-4 h-10 w-10" />
                <p>Masuk atau daftar dengan WhatsApp OTP</p>
              </div>
            </div>
            <NuxtLink
              to="/"
              class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-white"
            >
              <IconHeroiconsArrowLeft20Solid class="h-4 w-4" />
              Kembali
            </NuxtLink>
          </div>

          <!-- Right: Form (primary theme) -->
          <div class="flex flex-col min-h-0 overflow-hidden">
            <div class="flex-1 w-full bg-primary text-white overflow-y-auto">
              <div class="mx-auto max-w-md min-h-full flex flex-col justify-center p-5 pt-6 pb-8 lg:p-8 space-y-6">
                <!-- Inline Logo -->
                <div
                  v-if="logo"
                  class="flex justify-center"
                >
                  <NuxtLink
                    to="/"
                    class="inline-flex items-center justify-center px-3 py-2"
                  >
                    <NuxtImg
                      :src="logo"
                      alt="Logo"
                      class="h-16 w-auto"
                      format="webp"
                    />
                  </NuxtLink>
                </div>

                <!-- Header copy (above tabs) -->
                <div class="text-center space-y-2">
                  <span class="badge-modern inline-flex items-center justify-center gap-2">
                    {{ activeTab === 'login' ? 'Login EO' : 'Registrasi EO' }}
                  </span>
                  <h1 class="text-2xl font-bold tracking-tighter leading-[1.15]">
                    {{ activeTab === 'login' ? 'Masuk dengan WhatsApp OTP' : 'Daftar dengan WhatsApp OTP' }}
                  </h1>
                  <p class="text-sm text-white/80">
                    {{ activeTab === 'login' ? 'Nomor WhatsApp akan digunakan untuk verifikasi dan mengakses akun Anda.' : 'Lengkapi data di bawah untuk membuat akun baru. Email bersifat opsional.' }}
                  </p>
                </div>

                <!-- Tabs -->
                <div class="flex items-center gap-2 rounded-2xl bg-white/10 p-1.5">
                  <button
                    type="button"
                    :class="[
                      'flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2',
                      activeTab === 'login' ? 'bg-white text-primary ring-1 ring-secondary' : 'text-white/80 hover:bg-white/10'
                    ]"
                    @click="activeTab = 'login'; step = 1"
                  >
                    <IconHeroiconsDevicePhoneMobile20Solid class="h-5 w-5" />
                    Login
                  </button>
                  <button
                    type="button"
                    :class="[
                      'flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2',
                      activeTab === 'register' ? 'bg-white text-primary ring-1 ring-secondary' : 'text-white/80 hover:bg-white/10'
                    ]"
                    @click="activeTab = 'register'; step = 1"
                  >
                    <IconHeroiconsUserPlus20Solid class="h-5 w-5" />
                    Register
                  </button>
                </div>

                <!-- Forms -->
                <div>
                  <form
                    class="space-y-6"
                    @submit.prevent
                  >
                    <!-- Success Message -->
                    <p
                      v-if="successMessage"
                      class="rounded-xl bg-secondary/20 border border-secondary px-4 py-3 text-sm text-white font-medium"
                    >
                      {{ successMessage }}
                    </p>
                    
                    <!-- Error Message -->
                    <p
                      v-if="errorMessage"
                      class="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3 text-sm text-white"
                    >
                      {{ errorMessage }}
                    </p>
                    
                    <!-- Step 1: Phone Number (+ Name & Email for Register) -->
                    <div
                      v-if="step === 1"
                      class="space-y-4"
                    >
                      <!-- Nomor WhatsApp -->
                      <div class="space-y-2">
                        <label class="block text-sm font-semibold text-white/90">Nomor WhatsApp *</label>
                        <div class="flex items-center gap-2">
                          <span class="rounded-xl bg-white/10 px-3 py-2 text-sm text-white/80">+62</span>
                          <input
                            v-model="phone"
                            type="tel"
                            placeholder="81234567890"
                            required
                            class="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/60 focus:border-secondary focus:bg-white/15 focus:outline-none"
                          >
                        </div>
                      </div>

                      <!-- Nama & Email (hanya untuk Register) -->
                      <template v-if="activeTab === 'register'">
                        <div class="space-y-2">
                          <label class="block text-sm font-semibold text-white/90">Nama Lengkap *</label>
                          <input
                            v-model="name"
                            type="text"
                            placeholder="Masukkan nama lengkap Anda"
                            required
                            class="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/60 focus:border-secondary focus:bg-white/15 focus:outline-none"
                          >
                        </div>
                        <div class="space-y-2">
                          <label class="block text-sm font-semibold text-white/90">Email (opsional)</label>
                          <input
                            v-model="email"
                            type="email"
                            placeholder="email@example.com"
                            class="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/60 focus:border-secondary focus:bg-white/15 focus:outline-none"
                          >
                          <p class="text-xs text-white/60">
                            Email dapat digunakan untuk notifikasi dan komunikasi event.
                          </p>
                        </div>
                      </template>

                      <!-- Submit Button -->
                      <button
                        type="button"
                        class="w-full rounded-xl bg-secondary px-4 py-2 font-semibold text-primary hover:bg-secondary/90 disabled:opacity-50 transition-all"
                        :disabled="loading || !phone || (activeTab === 'register' && !name)"
                        @click="activeTab === 'register' ? onSubmitRegister() : onSend()"
                      >
                        {{ loading ? 'Memproses...' : (activeTab === 'register' ? 'Daftar & Kirim OTP' : 'Kirim OTP') }}
                      </button>
                    </div>

                    <!-- Step 2: OTP Verification -->
                    <div
                      v-else-if="step === 2"
                      class="space-y-4"
                    >
                      <div class="space-y-2">
                        <label class="block text-sm font-semibold text-white/90">Kode OTP</label>
                        <input
                          v-model="code"
                          type="text"
                          maxlength="6"
                          placeholder="123456"
                          class="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-center text-sm tracking-widest font-mono text-white placeholder-white/60 focus:border-secondary focus:bg-white/15 focus:outline-none"
                        >
                      </div>
                      <div class="flex items-center justify-between text-sm text-white/80">
                        <button
                          type="button"
                          class="text-white hover:text-secondary transition-colors"
                          :disabled="resendCooldown > 0 || loading"
                          @click="onSend"
                        >
                          {{ resendCooldown > 0 ? `Kirim ulang dalam ${resendCooldown}s` : 'Kirim Ulang OTP' }}
                        </button>
                        <button
                          type="button"
                          class="text-white/70 hover:text-secondary transition-colors"
                          :disabled="loading"
                          @click="step = 1; code = ''"
                        >
                          Ubah nomor
                        </button>
                      </div>
                      <button
                        type="button"
                        class="w-full rounded-xl bg-secondary px-4 py-2 font-semibold text-primary hover:bg-secondary/90 disabled:opacity-50 transition-all"
                        :disabled="loading || !code"
                        @click="activeTab === 'register' ? onVerifyAndRegister() : onVerifyLogin()"
                      >
                        {{ loading ? 'Memverifikasi...' : (activeTab === 'login' ? 'Verifikasi & Masuk' : 'Verifikasi & Simpan Data') }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
