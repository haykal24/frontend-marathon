<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from '#imports'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { useAuth } from '~/composables/useAuth'
import { useSubmitEvent } from '~/composables/useSubmitEvent'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'
import { formatRupiah, parseRupiah, formatDateWithDay } from '~/utils/format'
import LayoutPageHeader from '~/components/layout/PageHeader.vue'
import MitraSidebarNav from '~/components/mitra/SidebarNav.vue'
import IconHeroiconsXMark from '~icons/heroicons/x-mark'
import IconMdiChevronDown from '~icons/mdi/chevron-down'
import IconMdiCheck from '~icons/mdi/check'
import IconMdiCalendar from '~icons/mdi/calendar'
import IconMdiPlus from '~icons/mdi/plus'

definePageMeta({
  middleware: ['auth'],
})

useSeoMetaDynamic({
  title: 'Kirim Event Lari - Dashboard Mitra',
  description: 'Kirim event lari Anda ke platform indonesiamarathon.com',
  url: '/mitra/event/submit',
})

const router = useRouter()
const { isAuthenticated } = useAuth()
const { getImage } = useSiteSettings()
const headerBg = getImage('header_bg_dashboard', null) ?? undefined

const CONTACT_LABEL_OPTIONS = [
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Email', label: 'Email' },
  { value: 'Hotline', label: 'Hotline' },
  { value: 'Website', label: 'Website' },
  { value: 'Formulir', label: 'Form Pendaftaran' },
  { value: 'Instagram DM', label: 'Instagram DM' },
  { value: 'Lainnya', label: 'Lainnya' },
]

const SOCIAL_PLATFORM_OPTIONS = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'X / Twitter', label: 'X / Twitter' },
  { value: 'Threads', label: 'Threads' },
  { value: 'Website', label: 'Website' },
  { value: 'Lainnya', label: 'Lainnya' },
]

const {
  form,
  eventTypes,
  categories,
  ratePackages,
  loading,
  error,
  success: _success,
  createEventType,
  createCategory,
  submitEvent,
  init,
} = useSubmitEvent()

const breadcrumbs = computed(() => [
  { text: 'Dashboard', link: '/mitra/dashboard' },
  { text: 'Kirim Event', link: null },
])

const showNewTypeInput = ref(false)
const showNewCategoryInput = ref(false)
const newTypeName = ref('')
const newCategoryName = ref('')
const creatingType = ref(false)
const creatingCategory = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
const imagePreview = ref<string | null>(null)
const newBenefit = ref('')

const eventDateInput = ref<HTMLInputElement | null>(null)
const eventEndDateInput = ref<HTMLInputElement | null>(null)

const openDatePicker = (input: HTMLInputElement | null) => {
  if (!input) return
  if (typeof input.showPicker === 'function') {
    input.showPicker()
  } else {
    input.focus()
    input.click()
  }
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    await router.push('/login?next=/mitra/event/submit')
    return
  }
  await init()
})

const handleAddEventType = async () => {
  if (!newTypeName.value.trim()) return
  try {
    creatingType.value = true
    const created = await createEventType(newTypeName.value)
    if (created) {
      form.event_type = created.slug
      newTypeName.value = ''
      showNewTypeInput.value = false
    }
  } finally {
    creatingType.value = false
  }
}

const handleAddCategory = async () => {
  if (!newCategoryName.value.trim()) return
  try {
    creatingCategory.value = true
    const created = await createCategory(newCategoryName.value)
    if (created) {
      form.category_ids.push(created.id)
      newCategoryName.value = ''
      showNewCategoryInput.value = false
    }
  } finally {
    creatingCategory.value = false
  }
}

const ensureCategoryFeeEntries = () => {
  if (!categories.value?.length) return

  const selectedNames = form.category_ids
    .map(id => categories.value.find(c => c.id === id)?.name)
    .filter((name): name is string => Boolean(name))

  const currentAutoFees = form.registration_fees.filter(fee => !fee.isManual && fee.category)
  const autoMap = new Map(currentAutoFees.map(fee => [fee.category, fee]))
  const manualFees = form.registration_fees.filter(fee => fee.isManual)

  const autoFees = selectedNames.map(name => {
    if (autoMap.has(name)) {
      return autoMap.get(name)!
    }
    return { category: name, price: '', isManual: false }
  })

  form.registration_fees = [...autoFees, ...manualFees]
}

const handleToggleCategory = (id: number) => {
  const index = form.category_ids.indexOf(id)
  if (index > -1) {
    form.category_ids.splice(index, 1)
  } else {
    form.category_ids.push(id)
  }
  ensureCategoryFeeEntries()
}

const handleRemoveCategory = (id: number) => {
  form.category_ids = form.category_ids.filter(cid => cid !== id)
  ensureCategoryFeeEntries()
}

watch(
  () => [...form.category_ids],
  () => ensureCategoryFeeEntries(),
  { immediate: true }
)

watch(
  () => categories.value,
  () => ensureCategoryFeeEntries(),
  { deep: true }
)

const handleSubmit = async () => {
  if (loading.value) return
  try {
    await submitEvent(form)
    toastType.value = 'success'
    toastMessage.value = 'Event berhasil dikirim! Menunggu review admin.'
    showToast.value = true
    setTimeout(() => {
      router.push('/mitra/dashboard')
    }, 2000)
  } catch {
    toastType.value = 'error'
    toastMessage.value = error.value || 'Gagal mengirim event. Silakan coba lagi.'
    showToast.value = true
  }
}



const handleImageSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Ukuran file terlalu besar. Maksimal 5MB.'
      return
    }
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      error.value = 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.'
      return
    }
    form.image = file
    const reader = new FileReader()
    reader.onload = (evt) => {
      imagePreview.value = evt.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleAddBenefit = () => {
  const value = newBenefit.value.trim()
  if (!value) return
  form.benefits.push(value)
  newBenefit.value = ''
}

const handleRemoveBenefit = (index: number) => {
  form.benefits.splice(index, 1)
}

const handleAddRegistrationFee = () => {
  form.registration_fees.push({ category: '', price: '', isManual: true })
}

const handleRemoveRegistrationFee = (index: number) => {
  form.registration_fees.splice(index, 1)
}

const handleAddContactInfo = () => {
  form.contact_info.push({ label: '', value: '' })
}

const handleRemoveContactInfo = (index: number) => {
  form.contact_info.splice(index, 1)
}

const handleAddSocialMedia = () => {
  form.social_media.push({ platform: '', handle: '' })
}

const handleRemoveSocialMedia = (index: number) => {
  form.social_media.splice(index, 1)
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <LayoutPageHeader
      title="Kirim Event Lari"
      description="Bagikan event lari Anda ke ribuan pelari di Indonesia Marathon."
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
            <div class="rounded-2xl border border-secondary/70 bg-white p-6 lg:p-8">
              <form
                class="space-y-5"
                @submit.prevent="handleSubmit"
              >
                <!-- Pilih Paket Layanan -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Pilih Paket Layanan *</label>
                  <p class="text-xs text-gray-500 mb-3">
                    Pilih paket promosi untuk event Anda. Lihat detail paket di <NuxtLink
                      to="/rate-card"
                      class="text-secondary hover:underline font-medium"
                    >
                      Halaman Rate Card
                    </NuxtLink>.
                  </p>
                  <Listbox v-model="form.rate_package_id">
                    <div class="relative w-full">
                      <ListboxButton
                        class="relative w-full cursor-default rounded-xl border border-secondary/70 bg-white px-4 py-2 text-sm text-left text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                      >
                        <span class="block truncate text-sm">
                          {{
                            ratePackages.find(p => p.id === form.rate_package_id)?.name ||
                              'Pilih paket layanan'
                          }}
                        </span>
                        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <IconMdiChevronDown class="h-5 w-5 text-gray-400" />
                        </span>
                      </ListboxButton>
                      <transition
                        leave-active-class="transition duration-100 ease-in"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                      >
                        <ListboxOptions
                          class="absolute z-50 left-0 mt-2 w-full overflow-auto rounded-xl bg-white text-sm shadow-lg ring-1 ring-secondary/40 focus:outline-none max-h-60"
                        >
                          <ListboxOption
                            v-for="pkg in ratePackages"
                            :key="pkg.id"
                            v-slot="{ active, selected }"
                            :value="pkg.id"
                            as="template"
                          >
                            <li
                              :class="[
                                active ? 'bg-secondary/10 text-primary' : 'text-gray-900',
                                'relative cursor-default select-none py-2 pl-10 pr-4',
                              ]"
                            >
                              <div class="flex items-center justify-between">
                                <div>
                                  <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                                    {{ pkg.name }}
                                  </span>
                                  <span
                                    v-if="pkg.price_display"
                                    class="text-xs text-gray-500"
                                  >
                                    {{ pkg.price_display }}
                                  </span>
                                </div>
                                <span
                                  v-if="selected"
                                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary"
                                >
                                  <IconMdiCheck class="h-5 w-5" />
                                </span>
                              </div>
                            </li>
                          </ListboxOption>
                        </ListboxOptions>
                      </transition>
                    </div>
                  </Listbox>
                </div>

                <!-- Judul Event -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Judul Event *</label>
                  <input
                    v-model="form.title"
                    type="text"
                    required
                    placeholder="cth: Jakarta Marathon 2025"
                    class="w-full rounded-xl border border-secondary/70 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-sm placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                  >
                </div>

                <!-- Deskripsi -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Deskripsi Event</label>
                  <textarea
                    v-model="form.description"
                    rows="4"
                    placeholder="Jelaskan event Anda dengan detail..."
                    class="w-full rounded-xl border border-secondary/70 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-sm placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all resize-none"
                  />
                </div>

                <!-- Upload Gambar Poster -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Gambar Poster Event (opsional)</label>
                  <div class="space-y-3">
                    <div class="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        class="hidden"
                        @change="handleImageSelect"
                      >
                      <label
                        class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-secondary/50 rounded-xl cursor-pointer hover:border-secondary transition-colors bg-gray-50/50"
                      >
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            class="w-10 h-10 mb-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p class="mb-2 text-sm text-gray-500">
                            <span class="font-semibold">Klik untuk upload</span> atau drag & drop
                          </p>
                          <p class="text-xs text-gray-500">
                            PNG, JPG, WEBP (Max. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          @change="handleImageSelect"
                        >
                      </label>
                    </div>
                    <div
                      v-if="form.image"
                      class="relative inline-block"
                    >
                      <img
                        :src="imagePreview || ''"
                        alt="Preview"
                        class="h-32 w-auto rounded-xl border border-secondary/30 object-cover"
                      >
                      <button
                        type="button"
                        class="absolute -top-2 -right-2 rounded-xl bg-red-500 text-white p-1 hover:bg-red-600 transition-colors"
                        @click="form.image = null"
                      >
                        <IconHeroiconsXMark class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Grid 2 Kolom -->
                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <!-- Lokasi -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Lokasi Event *</label>
                    <input
                      v-model="form.location_name"
                      type="text"
                      required
                      placeholder="cth: Stadion GBK, Jakarta"
                      class="w-full rounded-xl border border-secondary/70 bg-white px-4 py-2 text-sm placeholder:text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    >
                  </div>

                  <!-- Kota -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Kota *</label>
                    <input
                      v-model="form.city"
                      type="text"
                      required
                      placeholder="cth: Jakarta"
                      class="w-full rounded-xl border border-secondary/70 bg-white px-4 py-2 text-sm placeholder:text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    >
                  </div>

                  <!-- Provinsi -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Provinsi (opsional)</label>
                    <input
                      v-model="form.province"
                      type="text"
                      placeholder="cth: DKI Jakarta"
                      class="w-full rounded-xl border border-secondary/70 bg-white px-4 py-2 text-sm placeholder:text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    >
                  </div>
                </div>

                <!-- Tanggal Event (1 Baris) -->
                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <!-- Tanggal Mulai -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Tanggal Event *</label>
                    <div class="relative">
                      <input
                        :id="'event_date'"
                        ref="eventDateInput"
                        v-model="form.event_date"
                        type="date"
                        required
                        class="w-full rounded-xl border border-secondary/70 bg-white px-4 py-2 pr-10 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                      >
                      <button
                        type="button"
                        class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-secondary transition-colors pointer-events-auto"
                        @click="openDatePicker(eventDateInput)"
                      >
                        <IconMdiCalendar class="h-5 w-5" />
                      </button>
                    </div>
                    <p
                      v-if="form.event_date"
                      class="mt-1.5 text-xs text-gray-600 font-medium"
                    >
                      {{ formatDateWithDay(form.event_date) }}
                    </p>
                  </div>

                  <!-- Tanggal Akhir -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Tanggal Selesai (opsional)</label>
                    <div class="relative">
                      <input
                        :id="'event_end_date'"
                        ref="eventEndDateInput"
                        v-model="form.event_end_date"
                        type="date"
                        class="w-full rounded-xl border border-secondary/70 bg-white px-4 py-2 pr-10 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                      >
                      <button
                        type="button"
                        class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-secondary transition-colors pointer-events-auto"
                        @click="openDatePicker(eventEndDateInput)"
                      >
                        <IconMdiCalendar class="h-5 w-5" />
                      </button>
                    </div>
                    <p
                      v-if="form.event_end_date"
                      class="mt-1.5 text-xs text-gray-600 font-medium"
                    >
                      {{ formatDateWithDay(form.event_end_date) }}
                    </p>
                  </div>
                </div>

                <!-- Grid 2 Kolom (Jenis Event & Organizer) -->
                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <!-- Jenis Event (Custom Dropdown) -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Jenis Event *</label>
                    <div class="space-y-2">
                      <Listbox v-model="form.event_type">
                        <div class="relative w-full">
                          <ListboxButton
                            class="relative w-full cursor-default rounded-xl border border-secondary/70 bg-white px-4 py-2 text-sm text-left text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                          >
                            <span class="block truncate">
                              {{ eventTypes.find(t => t.slug === form.event_type)?.name || 'Pilih jenis event' }}
                            </span>
                            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <IconMdiChevronDown class="h-5 w-5 text-gray-400" />
                            </span>
                          </ListboxButton>
                          <transition
                            leave-active-class="transition duration-100 ease-in"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                          >
                            <ListboxOptions
                              class="absolute z-50 left-0 mt-2 w-full overflow-auto rounded-xl bg-white text-base shadow-lg ring-1 ring-secondary/40 focus:outline-none sm:text-sm"
                            >
                              <ListboxOption
                                v-for="type in eventTypes"
                                :key="type.id"
                                v-slot="{ active, selected }"
                                :value="type.slug"
                                as="template"
                              >
                                <li
                                  :class="[
                                    active ? 'bg-secondary/10 text-primary' : 'text-gray-900',
                                    'relative cursor-default select-none py-2 pl-10 pr-4',
                                  ]"
                                >
                                  <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                                    {{ type.name }}
                                  </span>
                                  <span
                                    v-if="selected"
                                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary"
                                  >
                                    <IconMdiCheck class="h-5 w-5" />
                                  </span>
                                </li>
                              </ListboxOption>
                            </ListboxOptions>
                          </transition>
                        </div>
                      </Listbox>
                      <button
                        v-if="!showNewTypeInput"
                        type="button"
                        class="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:text-secondary hover:underline font-medium transition-colors"
                        @click="showNewTypeInput = true"
                      >
                        <IconMdiPlus class="h-3.5 w-3.5" />
                        <span>Tambah jenis event baru</span>
                      </button>
                      <div
                        v-else
                        class="flex gap-2"
                      >
                        <input
                          v-model="newTypeName"
                          type="text"
                          placeholder="Nama jenis event baru"
                          class="flex-1 rounded-xl border border-secondary/70 bg-white px-3 py-2 text-sm placeholder:text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                        >
                        <button
                          type="button"
                          :disabled="creatingType || !newTypeName"
                          class="rounded-xl bg-secondary px-3 py-2 text-xs font-semibold text-primary hover:bg-secondary/90 disabled:opacity-50 whitespace-nowrap"
                          @click="handleAddEventType"
                        >
                          {{ creatingType ? 'Membuat...' : 'Buat' }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Nama Organizer -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Nama Organizer (opsional)</label>
                    <input
                      v-model="form.organizer_name"
                      type="text"
                      placeholder="cth: Jakarta Running Community"
                      class="w-full rounded-xl border border-secondary/70 bg-white px-4 py-2 text-sm placeholder:text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    >
                  </div>
                </div>

                <!-- Kategori (Multiple Selection) -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-3">Kategori Event</label>
                  <div class="space-y-3">
                    <!-- Custom Checkbox Grid untuk Multiple Select -->
                    <div class="rounded-xl border border-secondary/70 bg-white p-4">
                      <div
                        v-if="categories.length === 0"
                        class="py-6 text-center text-sm text-gray-500"
                      >
                        Tidak ada kategori tersedia
                      </div>
                      <div
                        v-else
                        class="grid grid-cols-2 gap-3 sm:grid-cols-4"
                      >
                        <label
                          v-for="category in categories"
                          :key="category.id"
                          class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer group"
                        >
                          <div class="relative w-5 h-5 flex-shrink-0">
                            <input
                              type="checkbox"
                              :checked="form.category_ids.includes(category.id)"
                              class="absolute opacity-0 w-0 h-0"
                              @change="handleToggleCategory(category.id)"
                            >
                            <div
                              class="w-5 h-5 border-2 border-secondary/60 rounded-xl flex items-center justify-center transition-colors"
                              :class="
                                form.category_ids.includes(category.id)
                                  ? 'bg-secondary border-secondary'
                                  : 'group-hover:border-secondary'
                              "
                            >
                              <svg
                                v-if="form.category_ids.includes(category.id)"
                                class="w-3 h-3 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                          <span class="text-sm font-medium text-gray-900">{{ category.name }}</span>
                        </label>
                      </div>
                    </div>

                    <!-- Selected Tags Display -->
                    <div
                      v-if="form.category_ids.length > 0"
                      class="flex flex-wrap gap-2"
                    >
                      <div
                        v-for="catId in form.category_ids"
                        :key="catId"
                        class="inline-flex items-center gap-1.5 rounded-xl bg-secondary/20 px-3 py-1.5"
                      >
                        <span class="text-xs font-semibold text-primary">
                          {{ categories.find(c => c.id === catId)?.name }}
                        </span>
                        <button
                          type="button"
                          class="text-primary hover:text-red-500 transition-colors"
                          @click="handleRemoveCategory(catId)"
                        >
                          <IconHeroiconsXMark class="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <!-- Tambah Kategori Baru -->
                    <button
                      v-if="!showNewCategoryInput"
                      type="button"
                      class="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:text-secondary hover:underline font-medium transition-colors"
                      @click="showNewCategoryInput = true"
                    >
                      <IconMdiPlus class="h-3.5 w-3.5" />
                      <span>Tambah kategori baru</span>
                    </button>
                    <div
                      v-else
                      class="flex gap-2"
                    >
                      <input
                        v-model="newCategoryName"
                        type="text"
                        placeholder="Nama kategori baru"
                        class="flex-1 rounded-xl border border-secondary/70 bg-white px-3 py-2 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                      >
                      <button
                        type="button"
                        :disabled="creatingCategory || !newCategoryName"
                        class="rounded-xl bg-secondary px-3 py-2 text-xs font-semibold text-primary hover:bg-secondary/90 disabled:opacity-50 whitespace-nowrap"
                        @click="handleAddCategory"
                      >
                        {{ creatingCategory ? 'Membuat...' : 'Buat' }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Benefit Peserta -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Benefit Peserta</label>
                  <div class="space-y-3">
                    <div class="flex flex-col gap-2 sm:flex-row">
                      <input
                        v-model="newBenefit"
                        type="text"
                        placeholder="cth: Medali finisher, Kaos eksklusif, Asuransi"
                        class="flex-1 rounded-xl border border-secondary/70 bg-white px-4 py-2 text-sm placeholder:text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                        @keyup.enter.prevent="handleAddBenefit"
                      >
                      <button
                        type="button"
                        class="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary/90 disabled:opacity-40"
                        :disabled="!newBenefit.trim()"
                        @click="handleAddBenefit"
                      >
                        Tambah Benefit
                      </button>
                    </div>
                    <p class="text-xs text-gray-500">
                      Cantumkan benefit nyata yang diterima peserta (kaos, medali, asuransi, race pack, dll).
                    </p>
                    <div
                      v-if="form.benefits.length"
                      class="flex flex-wrap gap-2"
                    >
                      <div
                        v-for="(benefit, index) in form.benefits"
                        :key="`${benefit}-${index}`"
                        class="inline-flex items-center gap-1.5 rounded-xl bg-secondary/20 px-3 py-1.5 text-xs font-semibold text-primary"
                      >
                        <span>{{ benefit }}</span>
                        <button
                          type="button"
                          class="text-primary hover:text-red-500 transition-colors"
                          @click="handleRemoveBenefit(index)"
                        >
                          <IconHeroiconsXMark class="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div
                      v-else
                      class="rounded-xl border border-dashed border-secondary/50 px-4 py-3 text-sm text-gray-500"
                    >
                      Belum ada benefit ditambahkan.
                    </div>
                  </div>
                </div>

                <!-- Biaya Registrasi -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <label class="block text-sm font-semibold text-gray-900">Biaya Registrasi</label>
                      <p class="text-xs text-gray-500">
                        Tambahkan kategori jarak beserta biayanya (cth: 5K - Rp250.000).
                      </p>
                    </div>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-xl border border-secondary/60 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-secondary/10 transition-colors"
                      @click="handleAddRegistrationFee"
                    >
                      <IconMdiPlus class="h-3.5 w-3.5" />
                      Tambah Biaya
                    </button>
                  </div>
                  <div
                    v-if="form.registration_fees.length"
                    class="space-y-3"
                  >
                    <div
                      v-for="(fee, index) in form.registration_fees"
                      :key="`fee-${index}`"
                      class="grid grid-cols-1 gap-3 rounded-xl border border-secondary/30 bg-white/80 p-4 sm:grid-cols-2"
                    >
                      <div>
                        <label class="text-xs font-semibold text-gray-700 mb-1 block">Kategori / Jarak</label>
                        <template v-if="fee.isManual">
                          <input
                            v-model="fee.category"
                            type="text"
                            placeholder="cth: 5K, 10K, Half Marathon"
                            class="w-full rounded-xl border border-secondary/70 bg-white px-3 py-2 text-sm placeholder:text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                          >
                        </template>
                        <template v-else>
                          <div class="w-full rounded-xl border border-secondary/30 bg-gray-50 px-3 py-2 text-sm font-semibold text-primary">
                            {{ fee.category }}
                          </div>
                          <p class="mt-1 text-[11px] text-gray-500">
                            Judul otomatis mengikuti kategori yang dipilih.
                          </p>
                        </template>
                      </div>
                      <div class="flex gap-2">
                        <div class="flex-1">
                          <label class="text-xs font-semibold text-gray-700 mb-1 block">Biaya</label>
                          <input
                            :value="fee.price ? formatRupiah(fee.price) : ''"
                            type="text"
                            placeholder="cth: 350000"
                            class="w-full rounded-xl border border-secondary/70 bg-white px-3 py-2 text-sm placeholder:text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                            @input="(e: Event) => {
                              const target = e.target as HTMLInputElement
                              const raw = parseRupiah(target.value)
                              fee.price = raw || ''
                            }"
                          >
                        </div>
                        <button
                          v-if="fee.isManual"
                          type="button"
                          class="self-end rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                          @click="handleRemoveRegistrationFee(index)"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else
                    class="rounded-xl border border-dashed border-secondary/50 px-4 py-3 text-sm text-gray-500"
                  >
                    Belum ada biaya registrasi yang ditambahkan.
                  </div>
                </div>

                <!-- Informasi Kontak -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <label class="block text-sm font-semibold text-gray-900">Informasi Kontak</label>
                      <p class="text-xs text-gray-500">
                        Cantumkan kontak resmi untuk peserta (WhatsApp EO, email, call center, dll).
                      </p>
                    </div>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-xl border border-secondary/60 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-secondary/10 transition-colors"
                      @click="handleAddContactInfo"
                    >
                      <IconMdiPlus class="h-3.5 w-3.5" />
                      Tambah Kontak
                    </button>
                  </div>
                  <div
                    v-if="form.contact_info.length"
                    class="space-y-3"
                  >
                    <div
                      v-for="(contact, index) in form.contact_info"
                      :key="`contact-${index}`"
                      class="grid grid-cols-1 gap-3 rounded-xl border border-secondary/30 bg-white/80 p-4 sm:grid-cols-2"
                    >
                      <div>
                        <label class="text-xs font-semibold text-gray-700 mb-1 block">Label</label>
                        <Listbox v-model="contact.label">
                          <div class="relative">
                            <ListboxButton
                              class="relative w-full cursor-default rounded-xl border border-secondary/70 bg-white px-3 py-2 text-sm text-left text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                            >
                              <span class="block truncate text-sm">
                                {{ contact.label || 'Pilih Label Kontak' }}
                              </span>
                              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <IconMdiChevronDown class="h-5 w-5 text-gray-400" />
                              </span>
                            </ListboxButton>
                            <transition
                              leave-active-class="transition duration-100 ease-in"
                              leave-from-class="opacity-100"
                              leave-to-class="opacity-0"
                            >
                              <ListboxOptions
                                class="absolute z-50 left-0 mt-1 w-full overflow-auto rounded-xl bg-white text-sm shadow-lg ring-1 ring-secondary/40 focus:outline-none max-h-48"
                              >
                                <ListboxOption
                                  v-for="option in CONTACT_LABEL_OPTIONS"
                                  :key="option.value"
                                  v-slot="{ active, selected }"
                                  :value="option.label"
                                  as="template"
                                >
                                  <li
                                    :class="[
                                      active ? 'bg-secondary/10 text-primary' : 'text-gray-900',
                                      'relative cursor-default select-none py-2 pl-10 pr-4',
                                    ]"
                                  >
                                    <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                                      {{ option.label }}
                                    </span>
                                    <span
                                      v-if="selected"
                                      class="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary"
                                    >
                                      <IconMdiCheck class="h-5 w-5" />
                                    </span>
                                  </li>
                                </ListboxOption>
                              </ListboxOptions>
                            </transition>
                          </div>
                        </Listbox>
                      </div>
                      <div class="flex gap-2">
                        <div class="flex-1">
                          <label class="text-xs font-semibold text-gray-700 mb-1 block">Detail Kontak</label>
                          <input
                            v-model="contact.value"
                            type="text"
                            placeholder="cth: 0812-XXXX-XXXX"
                            class="w-full rounded-xl border border-secondary/70 bg-white px-3 py-2 text-sm placeholder:text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                          >
                        </div>
                        <button
                          type="button"
                          class="self-end rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                          @click="handleRemoveContactInfo(index)"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else
                    class="rounded-xl border border-dashed border-secondary/50 px-4 py-3 text-sm text-gray-500"
                  >
                    Tambahkan minimal satu kontak agar peserta mudah menghubungi EO.
                  </div>
                </div>

                <!-- Sosial Media -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <label class="block text-sm font-semibold text-gray-900">Sosial Media Event</label>
                      <p class="text-xs text-gray-500">
                        Bagikan akun resmi event di Instagram, TikTok, YouTube, atau platform lainnya.
                      </p>
                    </div>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-xl border border-secondary/60 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-secondary/10 transition-colors"
                      @click="handleAddSocialMedia"
                    >
                      <IconMdiPlus class="h-3.5 w-3.5" />
                      Tambah Sosial Media
                    </button>
                  </div>
                  <div
                    v-if="form.social_media.length"
                    class="space-y-3"
                  >
                    <div
                      v-for="(social, index) in form.social_media"
                      :key="`social-${index}`"
                      class="grid grid-cols-1 gap-3 rounded-xl border border-secondary/30 bg-white/80 p-4 sm:grid-cols-2"
                    >
                      <div>
                        <label class="text-xs font-semibold text-gray-700 mb-1 block">Platform</label>
                        <Listbox v-model="social.platform">
                          <div class="relative">
                            <ListboxButton
                              class="relative w-full cursor-default rounded-xl border border-secondary/70 bg-white px-3 py-2 text-sm text-left text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                            >
                              <span class="block truncate text-sm">
                                {{ social.platform || 'Pilih Platform' }}
                              </span>
                              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <IconMdiChevronDown class="h-5 w-5 text-gray-400" />
                              </span>
                            </ListboxButton>
                            <transition
                              leave-active-class="transition duration-100 ease-in"
                              leave-from-class="opacity-100"
                              leave-to-class="opacity-0"
                            >
                              <ListboxOptions
                                class="absolute z-50 left-0 mt-1 w-full overflow-auto rounded-xl bg-white text-sm shadow-lg ring-1 ring-secondary/40 focus:outline-none max-h-48"
                              >
                                <ListboxOption
                                  v-for="option in SOCIAL_PLATFORM_OPTIONS"
                                  :key="option.value"
                                  v-slot="{ active, selected }"
                                  :value="option.label"
                                  as="template"
                                >
                                  <li
                                    :class="[
                                      active ? 'bg-secondary/10 text-primary' : 'text-gray-900',
                                      'relative cursor-default select-none py-2 pl-10 pr-4',
                                    ]"
                                  >
                                    <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                                      {{ option.label }}
                                    </span>
                                    <span
                                      v-if="selected"
                                      class="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary"
                                    >
                                      <IconMdiCheck class="h-5 w-5" />
                                    </span>
                                  </li>
                                </ListboxOption>
                              </ListboxOptions>
                            </transition>
                          </div>
                        </Listbox>
                      </div>
                      <div class="flex gap-2">
                        <div class="flex-1">
                          <label class="text-xs font-semibold text-gray-700 mb-1 block">Handle / Link</label>
                          <input
                            v-model="social.handle"
                            type="text"
                            placeholder="cth: @indorunners"
                            class="w-full rounded-xl border border-secondary/70 bg-white px-3 py-2 text-sm placeholder:text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                          >
                        </div>
                        <button
                          type="button"
                          class="self-end rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                          @click="handleRemoveSocialMedia(index)"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else
                    class="rounded-xl border border-dashed border-secondary/50 px-4 py-3 text-sm text-gray-500"
                  >
                    Tambahkan akun resmi agar peserta bisa memantau update event.
                  </div>
                </div>

                <!-- URL Pendaftaran -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Link Pendaftaran (opsional)</label>
                  <input
                    v-model="form.registration_url"
                    type="url"
                    placeholder="https://..."
                    class="w-full rounded-xl border border-secondary/70 bg-white px-4 py-2 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  >
                </div>

                <!-- Tombol Submit -->
                <div class="flex items-center justify-end gap-3 border-t border-secondary/70 pt-5">
                  <UiAppButton
                    to="/mitra/dashboard"
                    variant="primary"
                    :disabled="loading"
                  >
                    Batal
                  </UiAppButton>
                  <UiAppButton
                    variant="secondary"
                    :disabled="loading"
                    @click="handleSubmit"
                  >
                    {{ loading ? 'Mengirim...' : 'Kirim Event' }}
                  </UiAppButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Toast Notification -->
    <UiToast
      :show="showToast"
      :type="toastType"
      :message="toastMessage"
      :duration="3000"
      @close="showToast = false"
    />
  </div>
</template>

