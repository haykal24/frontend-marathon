import { ref, reactive } from 'vue'
import { useApi } from './useApi'

interface EventTypeOption {
  id: number
  name: string
  slug: string
  description?: string
}

interface CategoryOption {
  id: number
  name: string
  slug: string
}

interface RatePackageOption {
  id: number
  name: string
  slug: string
  price_display: string | null
  description: string | null
}

interface RegistrationFeeEntry {
  category: string
  price: string
}

interface ContactEntry {
  label: string
  value: string
}

interface SocialEntry {
  platform: string
  handle: string
}

interface SubmitEventForm {
  rate_package_id: number | null
  title: string
  description: string
  location_name: string
  city: string
  province: string
  event_date: string
  event_end_date: string | null
  event_type: string
  registration_url: string
  organizer_name: string
  category_ids: number[]
  benefits: string[]
  registration_fees: RegistrationFeeEntry[]
  contact_info: ContactEntry[]
  social_media: SocialEntry[]
  image: File | null
}

export const useSubmitEvent = () => {
  const api = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  const eventTypes = ref<EventTypeOption[]>([])
  const categories = ref<CategoryOption[]>([])
  const ratePackages = ref<RatePackageOption[]>([])

  const form = reactive<SubmitEventForm>({
    rate_package_id: null,
    title: '',
    description: '',
    location_name: '',
    city: '',
    province: '',
    event_date: '',
    event_end_date: null,
    event_type: '',
    registration_url: '',
    organizer_name: '',
    category_ids: [],
    benefits: [],
    registration_fees: [],
    contact_info: [],
    social_media: [],
    image: null,
  })

  /**
   * Fetch event types dari backend
   */
  const fetchEventTypes = async () => {
    try {
      const res = await api.get<{ data: EventTypeOption[] }>('/event-types')
      eventTypes.value = res.data || []
    } catch (e) {
      console.error('Failed to fetch event types:', e)
      error.value = 'Gagal memuat jenis event'
    }
  }

  /**
   * Fetch categories dari backend
   */
  const fetchCategories = async () => {
    try {
      const res = await api.get<{ data: CategoryOption[] }>('/event-categories')
      categories.value = res.data || []
    } catch (e) {
      console.error('Failed to fetch categories:', e)
      error.value = 'Gagal memuat kategori'
    }
  }

  /**
   * Fetch rate packages dari backend
   */
  const fetchRatePackages = async () => {
    try {
      const res = await api.get<{ data: RatePackageOption[] }>('/rate-packages', {
        params: { is_active: true },
      })
      ratePackages.value = res.data || []
    } catch (e) {
      console.error('Failed to fetch rate packages:', e)
      error.value = 'Gagal memuat paket layanan'
    }
  }

  /**
   * Buat event type baru
   */
  const createEventType = async (name: string) => {
    try {
      const res = await api.post<{ data: EventTypeOption }>('/event-types', { name })
      if (res.data) {
        eventTypes.value.push(res.data)
        return res.data
      }
    } catch (e) {
      error.value = 'Gagal membuat jenis event baru'
      throw e
    }
  }

  /**
   * Buat category baru
   */
  const createCategory = async (name: string) => {
    try {
      const res = await api.post<{ data: CategoryOption }>('/event-categories', { name })
      if (res.data) {
        categories.value.push(res.data)
        return res.data
      }
    } catch (e) {
      error.value = 'Gagal membuat kategori baru'
      throw e
    }
  }

  /**
   * Submit event
   */
  const submitEvent = async (formData: SubmitEventForm) => {
    loading.value = true
    error.value = null
    success.value = false

    try {
      // Use FormData for file upload
      const formPayload = new FormData()
      if (formData.rate_package_id) {
        formPayload.append('rate_package_id', formData.rate_package_id.toString())
      }
      formPayload.append('title', formData.title)
      formPayload.append('description', formData.description || '')
      formPayload.append('location_name', formData.location_name)
      formPayload.append('city', formData.city)
      formPayload.append('event_date', formData.event_date)
      if (formData.province) {
        formPayload.append('province', formData.province)
      }
      if (formData.event_end_date) {
        formPayload.append('event_end_date', formData.event_end_date)
      }
      formPayload.append('event_type', formData.event_type)
      if (formData.registration_url) {
        formPayload.append('registration_url', formData.registration_url)
      }
      if (formData.organizer_name) {
        formPayload.append('organizer_name', formData.organizer_name)
      }
      if (formData.category_ids.length > 0) {
        formData.category_ids.forEach((id) => {
          formPayload.append('categories[]', id.toString())
        })
      }

      if (formData.benefits.length > 0) {
        const benefits = formData.benefits.filter(Boolean)
        if (benefits.length) {
          formPayload.append('benefits', JSON.stringify(benefits))
        }
      }

      const registrationFees = formData.registration_fees
        .filter(entry => entry.category.trim() && entry.price.trim())
        .reduce<Record<string, string>>((acc, entry) => {
          acc[entry.category.trim()] = entry.price.trim()
          return acc
        }, {})
      if (Object.keys(registrationFees).length > 0) {
        formPayload.append('registration_fees', JSON.stringify(registrationFees))
      }

      const contactInfo = formData.contact_info
        .filter(entry => entry.label.trim() && entry.value.trim())
        .reduce<Record<string, string>>((acc, entry) => {
          acc[entry.label.trim()] = entry.value.trim()
          return acc
        }, {})
      if (Object.keys(contactInfo).length > 0) {
        formPayload.append('contact_info', JSON.stringify(contactInfo))
      }

      const socialMedia = formData.social_media
        .filter(entry => entry.platform.trim() && entry.handle.trim())
        .reduce<Record<string, string>>((acc, entry) => {
          acc[entry.platform.trim()] = entry.handle.trim()
          return acc
        }, {})
      if (Object.keys(socialMedia).length > 0) {
        formPayload.append('social_media', JSON.stringify(socialMedia))
      }

      if (formData.image) {
        formPayload.append('image', formData.image)
      }

      await api.post('/events', formPayload)
      success.value = true
      resetForm()
      return true
    } catch (e: unknown) {
      const errorObj = e as { 
        data?: { 
          message?: string
          errors?: Record<string, string[]>
        } 
      }
      
      // Handle validation errors
      if (errorObj?.data?.errors) {
        const errors = errorObj.data.errors
        const errorMessages: string[] = []
        
        Object.entries(errors).forEach(([field, messages]) => {
          const fieldLabel: Record<string, string> = {
            benefits: 'Benefit Peserta',
            contact_info: 'Informasi Kontak',
            registration_fees: 'Biaya Registrasi',
            social_media: 'Sosial Media',
            title: 'Judul Event',
            location_name: 'Lokasi Event',
            city: 'Kota',
            event_date: 'Tanggal Event',
            event_type: 'Jenis Event',
          }
          
          const label = fieldLabel[field] || field
          messages.forEach((msg: string) => {
            errorMessages.push(`${label}: ${msg}`)
          })
        })
        
        error.value = errorMessages.length > 0 
          ? errorMessages.join('\n')
          : 'Terdapat kesalahan pada data yang Anda masukkan. Silakan periksa kembali.'
      } else {
        error.value = errorObj?.data?.message || 'Gagal mengirim event. Silakan coba lagi.'
      }
      
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset form ke state awal
   */
  const resetForm = () => {
    form.rate_package_id = null
    form.title = ''
    form.description = ''
    form.location_name = ''
    form.city = ''
    form.province = ''
    form.event_date = ''
    form.event_end_date = null
    form.event_type = ''
    form.registration_url = ''
    form.organizer_name = ''
    form.category_ids = []
    form.benefits = []
    form.registration_fees = []
    form.contact_info = []
    form.social_media = []
    form.image = null
  }

  /**
   * Init: fetch data dari backend
   */
  const init = async () => {
    await Promise.all([fetchEventTypes(), fetchCategories(), fetchRatePackages()])
  }

  return {
    form,
    eventTypes,
    categories,
    ratePackages,
    loading,
    error,
    success,
    fetchEventTypes,
    fetchCategories,
    fetchRatePackages,
    createEventType,
    createCategory,
    submitEvent,
    resetForm,
    init,
  }
}

