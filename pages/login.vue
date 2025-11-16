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
const router = useRouter()
const phone = ref('')
const code = ref('')
const errorMessage = ref<string | null>(null)
const { loading, step, resendCooldown, sendOtp, verifyOtp } = useOtp()
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
  if (!phone.value) return
  const res = await sendOtp(phone.value)
  if (!res.success) {
    errorMessage.value = res.message || 'Gagal mengirim OTP'
  }
}
const onVerify = async () => {
  errorMessage.value = null
  if (!phone.value || !code.value) return
  const res = await verifyOtp(phone.value, code.value)
  if (res.success) {
    router.push('/eo/dashboard')
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
            />
            <div v-else class="flex h-full w-full items-center justify-center text-primary/70 bg-white">
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
          <div class="flex min-h-0">
            <div class="h-full w-full bg-primary text-white p-5 pt-6 pb-8 lg:p-8">
              <div class="mx-auto max-w-md h-full flex flex-col justify-center space-y-8">
                <!-- Inline Logo -->
                <div v-if="logo" class="flex justify-center">
                  <NuxtLink to="/" class="inline-flex items-center justify-center px-3 py-2">
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
                    Nomor WhatsApp akan digunakan untuk verifikasi dan {{ activeTab === 'login' ? 'mengakses akun Anda.' : 'pembuatan akun baru.' }}
                  </p>
                </div>

                <!-- Tabs -->
                <div class="flex items-center gap-2 rounded-2xl bg-white/10 p-1.5">
                  <button
                    type="button"
                    @click="activeTab = 'login'; step = 1"
                    :class="[
                      'flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2',
                      activeTab === 'login' ? 'bg-white text-primary ring-1 ring-secondary' : 'text-white/80 hover:bg-white/10'
                    ]"
                  >
                    <IconHeroiconsDevicePhoneMobile20Solid class="h-5 w-5" />
                    Login
                  </button>
                  <button
                    type="button"
                    @click="activeTab = 'register'; step = 1"
                    :class="[
                      'flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2',
                      activeTab === 'register' ? 'bg-white text-primary ring-1 ring-secondary' : 'text-white/80 hover:bg-white/10'
                    ]"
                  >
                    <IconHeroiconsUserPlus20Solid class="h-5 w-5" />
                    Register
                  </button>
                </div>

                <!-- Forms -->
                <div>
                  <form class="space-y-6" @submit.prevent>
                    <p v-if="errorMessage" class="rounded-xl bg-white/10 px-4 py-3 text-sm text-secondary">
                      {{ errorMessage }}
                    </p>
                    <div v-if="step === 1" class="space-y-2">
                      <label class="block text-sm font-semibold text-white/90">Nomor WhatsApp</label>
                      <div class="flex items-center gap-2">
                        <span class="rounded-xl bg-white/10 px-3 py-2 text-white/80">+62</span>
                        <input
                          v-model="phone"
                          type="tel"
                          placeholder="81234567890"
                          class="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-white/60 focus:border-secondary focus:bg-white/15 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        class="w-full rounded-xl bg-secondary px-4 py-2 font-semibold text-primary hover:bg-secondary/90 disabled:opacity-50"
                        :disabled="loading || !phone"
                        @click="onSend"
                      >
                        {{ loading ? 'Mengirim...' : 'Kirim OTP' }}
                      </button>
                    </div>

                    <div v-else class="space-y-2">
                      <label class="block text-sm font-semibold text-white/90">Kode OTP</label>
                      <input
                        v-model="code"
                        type="text"
                        maxlength="6"
                        placeholder="123456"
                        class="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-center tracking-widest font-mono text-white placeholder-white/60 focus:border-secondary focus:bg-white/15 focus:outline-none"
                      />
                      <div class="flex items-center justify-between text-sm text-white/80">
                        <button
                          type="button"
                          class="text-white hover:text-secondary"
                          :disabled="resendCooldown > 0 || loading"
                          @click="onSend"
                        >
                          {{ resendCooldown > 0 ? `Kirim ulang dalam ${resendCooldown}s` : 'Kirim Ulang OTP' }}
                        </button>
                        <button
                          type="button"
                          class="text-white/70 hover:text-secondary"
                          :disabled="loading"
                          @click="step = 1"
                        >
                          Ubah nomor
                        </button>
                      </div>
                      <button
                        type="button"
                        class="w-full rounded-xl bg-secondary px-4 py-2 font-semibold text-primary hover:bg-secondary/90 disabled:opacity-50"
                        :disabled="loading || !code"
                        @click="onVerify"
                      >
                        {{ loading ? 'Memverifikasi...' : (activeTab === 'login' ? 'Verifikasi & Masuk' : 'Verifikasi & Daftar') }}
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
