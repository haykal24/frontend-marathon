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

export const getDescriptionSnippet = (description?: string | null, limit = 160): string => {
  if (!description) {
    return 'Platform #1 event lari Indonesia. Temukan jadwal, daftar, dan promosikan event Anda di sini.'
  }

  const clean = description.replace(/<[^>]+>/g, '').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}

export const sanitizeMediaUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined

  const trimmed = url.trim()
  if (!trimmed) return undefined

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
