<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from '#imports'
import LayoutPageHeader from '~/components/layout/PageHeader.vue'
import MitraSidebarNav from '~/components/mitra/SidebarNav.vue'
import { useAuth } from '~/composables/useAuth'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { useApi } from '~/composables/useApi'
import { useSiteSettings } from '~/composables/useSiteSettings'

useSeoMetaDynamic({
  title: 'Profil Saya - Dashboard Mitra',
  description: 'Kelola informasi akun Anda.',
  url: '/mitra/profile',
})

const api = useApi()
const router = useRouter()
const { isAuthenticated, user: _user } = useAuth()
const { getImage } = useSiteSettings()
const headerBg = getImage('header_bg_dashboard', null) ?? undefined

const breadcrumbs = computed(() => [
  { text: 'Dashboard', link: '/mitra/dashboard' },
  { text: 'Profil', link: null },
])

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  phone_number: '',
})

const init = async () => {
  try {
    loading.value = true
    const res = await api.get<{ data: { name: string; email: string; phone_number: string } }>('/me')
    if (res.data) {
      form.name = res.data.name || ''
      form.email = res.data.email || ''
      form.phone_number = res.data.phone_number || ''
    }
  } catch {
    error.value = 'Gagal memuat profil'
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  error.value = null
  successMessage.value = ''
  try {
    await api.put('/me', {
      name: form.name,
      email: form.email || null,
    })
    successMessage.value = 'Profil berhasil diperbarui'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch {
    error.value = 'Gagal menyimpan profil'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    await router.push('/login?next=/mitra/profile')
    return
  }
  await init()
})
</script>

<template>
  <div class="min-h-screen bg-surface">
    <LayoutPageHeader
      title="Profil Saya"
      description="Kelola informasi akun Anda."
      :background-image-url="headerBg"
      :breadcrumbs="breadcrumbs"
    />

    <section class="py-10">
      <div class="layout-container">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <MitraSidebarNav />
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3">
            <div class="rounded-2xl border border-secondary/20 bg-white p-6 lg:p-8">
              <!-- Success Message -->
              <div
                v-if="successMessage"
                class="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium"
              >
                ✓ {{ successMessage }}
              </div>

              <!-- Error Message -->
              <div
                v-if="error"
                class="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 font-medium"
              >
                ✕ {{ error }}
              </div>

              <!-- Loading State -->
              <div
                v-if="loading"
                class="text-center py-12 text-gray-500"
              >
                <div class="inline-flex items-center gap-2">
                  <div class="h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                  <span class="font-medium">Memuat data...</span>
                </div>
              </div>

              <!-- Form -->
              <div
                v-else
                class="grid grid-cols-1 gap-5"
              >
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Nama Lengkap</label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Masukkan nama Anda"
                    class="w-full rounded-xl border border-secondary/20 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                  >
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    class="w-full rounded-xl border border-secondary/20 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                  >
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Nomor WhatsApp</label>
                  <input
                    v-model="form.phone_number"
                    type="tel"
                    disabled
                    class="w-full rounded-xl border border-secondary/20 bg-gray-50 px-4 py-3 text-gray-600 cursor-not-allowed"
                  >
                  <p class="mt-2 text-xs text-gray-500">
                    Nomor WhatsApp tidak dapat diubah untuk keamanan akun Anda
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div
                v-if="!loading"
                class="mt-8 flex items-center justify-end gap-3 border-t border-secondary/10 pt-6"
              >
                <UiAppButton
                  variant="outline"
                  to="/mitra/dashboard"
                  :disabled="saving"
                >
                  Batal
                </UiAppButton>
                <UiAppButton
                  variant="secondary"
                  :disabled="saving"
                  @click="save"
                >
                  {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </UiAppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

