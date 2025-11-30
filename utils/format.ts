import type { Event } from '~/types/event'

export const formatEventType = (type?: string | null): string => {
  if (!type) {
    return 'Event Lari'
  }

  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface EventLocationLike {
  city?: string | null
  province?: string | null
  location_name?: string | null
}

export const formatEventLocation = (location: EventLocationLike): string => {
  const { city, province, location_name } = location
  const parts = [city, province].filter(Boolean) as string[]

  if (parts.length > 0) return parts.join(', ')

  return location_name ?? 'Lokasi akan diumumkan'
}

export const formatEventMeta = (event: Partial<Event>): string => {
  const typeLabel = formatEventType(event.event_type)

  const categorySources = event.categories ?? event.category_names ?? []
  const categoryLabels = (Array.isArray(categorySources) ? categorySources : [])
    .map(category => (typeof category === 'string' ? category : category?.name))
    .filter(Boolean) as string[]

  if (categoryLabels.length === 0 && event.registration_fees) {
    categoryLabels.push(...Object.keys(event.registration_fees))
  }

  const uniqueLabels = Array.from(new Set(categoryLabels)).filter(Boolean).slice(0, 3)

  if (uniqueLabels.length === 0) return typeLabel

  return [typeLabel, ...uniqueLabels].join(', ')
}

export const formatEventDate = (date?: string | null): string => {
  if (!date) {
    return 'Tanggal belum tersedia'
  }

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))
  } catch {
    return date
  }
}

export const formatEventDateRange = (
  startDate?: string | null,
  endDate?: string | null
): string => {
  if (!startDate) {
    return 'Tanggal belum tersedia'
  }

  try {
    const start = new Date(startDate)
    if (endDate) {
      const end = new Date(endDate)
      if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
        return `${new Intl.DateTimeFormat('id-ID', { day: 'numeric' }).format(start)} - ${new Intl.DateTimeFormat('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(end)}`
      }

      return `${new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
      }).format(start)} - ${new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(end)}`
    }

    return formatEventDate(startDate)
  } catch {
    return startDate
  }
}

/**
 * Format tanggal dengan hari (contoh: "Senin, 15 Januari 2025")
 * @param date - String tanggal (format: YYYY-MM-DD) atau Date object
 * @returns String format "hari, tanggal bulan tahun"
 */
export const formatDateWithDay = (date?: string | Date | null): string => {
  if (!date) {
    return ''
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return ''
    }

    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj)
  } catch {
    return ''
  }
}

export const getDescriptionSnippet = (description?: string | null, limit = 160): string => {
  if (!description) {
    return 'Platform #1 event lari Indonesia. Temukan jadwal, daftar, dan promosikan event Anda di sini.'
  }

  const clean = description.replace(/<[^>]+>/g, '').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}

export const sanitizeMediaUrl = (url?: string | null): string => {
  if (!url) return ''

  const trimmed = url.trim()
  if (!trimmed) return ''

  const firstSpace = trimmed.indexOf(' ')
  if (firstSpace !== -1) return trimmed.slice(0, firstSpace)

  return trimmed
}

export const formatBlogDate = (date?: string | null): string => {
  if (!date) {
    return 'Tanggal belum tersedia'
  }

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))
  } catch {
    return date
  }
}

export const calculateReadingTime = (content?: string | null): string | null => {
  if (!content) return null
  const text = content.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (!words) return null
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} menit baca`
}

/**
 * Format angka menjadi format rupiah dengan titik sebagai pemisah ribuan
 * @param value - Nilai yang akan diformat (string atau number)
 * @returns String format rupiah (contoh: "350.000" atau "1.500.000")
 */
export const formatRupiah = (value: string | number | null | undefined): string => {
  if (!value && value !== 0) return ''
  
  // Hapus semua karakter non-digit
  const numericValue = String(value).replace(/\D/g, '')
  
  if (!numericValue) return ''
  
  // Format dengan titik sebagai pemisah ribuan
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Parse format rupiah kembali ke angka (string tanpa format)
 * @param value - String format rupiah (contoh: "350.000" atau "Rp 1.500.000")
 * @returns String angka tanpa format (contoh: "350000")
 */
export const parseRupiah = (value: string | null | undefined): string => {
  if (!value) return ''
  
  // Hapus semua karakter non-digit
  return value.replace(/\D/g, '')
}
