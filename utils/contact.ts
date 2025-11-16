export const normalizePhoneNumber = (phone?: string | null): string | undefined => {
  if (!phone) return undefined

  const digits = phone.replace(/\D/g, '')
  if (!digits) return undefined

  if (digits.startsWith('62')) {
    return digits
  }

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`
  }

  return `62${digits}`
}

export const buildWhatsappUrl = (phone?: string | null): string | undefined => {
  const normalized = normalizePhoneNumber(phone)
  if (!normalized) return undefined
  return `https://wa.me/${normalized}`
}

export const formatWebsiteDisplay = (url?: string | null): string => {
  if (!url) return ''
  return url.replace(/^(https?:\/\/)?(www\.)?/, '')
}
