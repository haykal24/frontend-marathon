/**
 * Event-Specific FAQ Generator
 * 
 * Auto-generates event-specific Q&A berdasarkan event data:
 * - Cut off time
 * - Kategori/jarak
 * - Lokasi
 * - Tanggal
 */

const pickTemplate = (templates: string[], fallback: string): string => {
  if (!templates.length) {
    return fallback
  }
  const choice = templates[Math.floor(Math.random() * templates.length)]
  return choice ?? fallback
}

export interface EventData {
  title: string
  slug?: string
  event_date: string
  event_end_date?: string | null
  location_name: string
  city: string
  event_type?: string
  registration_url?: string | null // Match Event type
  registration_fees?: Record<string, string>
  categories?: Array<{ name: string }> | string[] // Match Event type (EventCategory[] | string[])
  contact_info?: Record<string, unknown>
  description?: string
}

export interface EventFaqItem {
  question: string
  answer: string
  isEventSpecific: boolean // Flag untuk identify apakah ini event-specific
}

/**
 * Generate event-specific FAQ berdasarkan event data
 */
export const generateEventFaq = (eventData: EventData): EventFaqItem[] => {
  const faqs: EventFaqItem[] = []

  // 1. FAQ: Kapan cut off time? (jika ada)
  if (eventData.registration_fees) {
    const feeEntries = Object.entries(eventData.registration_fees)
    if (feeEntries.length > 0) {
      faqs.push({
        question: `Berapa biaya registrasi ${eventData.title}?`,
        answer: generateBiayaAnswer(eventData),
        isEventSpecific: true,
      })
    }
  }

  // 2. FAQ: Kategori apa saja? (jika ada multiple categories)
  if (eventData.categories && eventData.categories.length > 0) {
    faqs.push({
      question: `Kategori jarak apa saja di ${eventData.title}?`,
      answer: generateKategoriAnswer(eventData),
      isEventSpecific: true,
    })
  }

  // 3. FAQ: Dimana lokasi event? (lokasi spesifik)
  if (eventData.location_name) {
    faqs.push({
      question: `Dimana lokasi ${eventData.title}?`,
      answer: generateLokasiAnswer(eventData),
      isEventSpecific: true,
    })
  }

  // 4. FAQ: Kapan tanggalnya? (date specific)
  if (eventData.event_date) {
    faqs.push({
      question: `Kapan ${eventData.title} 2025 akan diadakan?`,
      answer: generateTanggalAnswer(eventData),
      isEventSpecific: true,
    })
  }

  // 5. FAQ: Bagaimana cara mendaftar? (registration specific)
  if (eventData.registration_url) {
    faqs.push({
      question: `Bagaimana cara mendaftar ${eventData.title}?`,
      answer: generateDaftarAnswer(eventData),
      isEventSpecific: true,
    })
  }

  // 6. FAQ: Apa benefit peserta? (dari keywords atau event description)
  faqs.push({
    question: `Apa benefit mengikuti ${eventData.title}?`,
    answer: generateBenefitAnswer(eventData),
    isEventSpecific: true,
  })

  // 7. FAQ: Hubungi siapa untuk informasi lebih lanjut?
  if (eventData.contact_info) {
    faqs.push({
      question: `Bagaimana cara menghubungi panitia ${eventData.title}?`,
      answer: generateKontakAnswer(eventData),
      isEventSpecific: true,
    })
  }

  return faqs
}

/**
 * Generate answer untuk biaya registrasi
 */
const generateBiayaAnswer = (event: EventData): string => {
  if (!event.registration_fees) {
    return `Untuk informasi biaya registrasi ${event.title}, silakan kunjungi halaman pendaftaran resmi.`
  }

  const feeList = Object.entries(event.registration_fees)
    .map(([category, price]) => `${category}: ${price}`)
    .join(', ')

  const fallback = `Biaya registrasi ${event.title} menyesuaikan kategori jarak. Pastikan membaca detail pendaftaran sebelum checkout.`

  const templates = [
    `Biaya registrasi ${event.title} bervariasi berdasarkan kategori jarak: ${feeList}. Pembayaran dapat dilakukan melalui transfer bank atau online.`,
    `${event.title} menawarkan paket registrasi dengan harga: ${feeList}. Silakan cek halaman pendaftaran untuk detail pembayaran.`,
    `Investasi untuk mengikuti ${event.title} adalah sebagai berikut: ${feeList}. Early bird biasanya lebih murah, jadi daftar sekarang!`,
  ]

  return pickTemplate(templates, fallback)
}

/**
 * Generate answer untuk kategori jarak
 */
const generateKategoriAnswer = (event: EventData): string => {
  if (!event.categories || event.categories.length === 0) {
    return `${event.title} menawarkan beberapa pilihan kategori jarak. Silakan cek halaman pendaftaran untuk melihat kategori lengkap.`
  }

  // Handle both Array<{ name: string }> and string[]
  const categoryList = event.categories
    .map((cat) => (typeof cat === 'string' ? cat : cat.name))
    .join(', ')

  const fallback = `${event.title} menawarkan beberapa kategori jarak untuk berbagai level pelari.`

  const templates = [
    `${event.title} menyediakan kategori jarak berikut: ${categoryList}. Pilih kategori yang sesuai dengan kemampuan dan tujuan lari Anda.`,
    `Peserta ${event.title} dapat memilih dari kategori: ${categoryList}. Setiap kategori dirancang untuk berbagai level kemampuan.`,
    `Tersedia ${event.categories.length} kategori di ${event.title}: ${categoryList}. Tentukan pilihan Anda berdasarkan target jarak lari.`,
  ]

  return pickTemplate(templates, fallback)
}

/**
 * Generate answer untuk lokasi
 */
const generateLokasiAnswer = (event: EventData): string => {
  const fallback = `${event.title} berlokasi di ${event.location_name}, ${event.city}.`

  const templates = [
    `${event.title} akan diadakan di ${event.location_name}, ${event.city}. Lokasi ini dipilih karena rute yang menantang dan pemandangan yang indah.`,
    `Lokasi ${event.title} adalah ${event.location_name}, kota ${event.city}. Pastikan datang lebih awal untuk familiarize dengan area dan venue.`,
    `${event.title} dimulai dan berakhir di ${event.location_name}, ${event.city}. Lokasi ini strategic dan mudah diakses oleh peserta dari berbagai daerah.`,
  ]

  return pickTemplate(templates, fallback)
}

/**
 * Generate answer untuk tanggal
 */
const generateTanggalAnswer = (event: EventData): string => {
  const eventDate = new Date(event.event_date)
  const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedDate = dateFormatter.format(eventDate)

  const fallback = `${event.title} akan berlangsung pada ${formattedDate}.`

  const templates = [
    `${event.title} akan diselenggarakan pada ${formattedDate}. Segera daftarkan diri Anda dan persiapkan latihan!`,
    `Tanggal pelaksanaan ${event.title} adalah ${formattedDate}. Jangan lewatkan kesempatan ini untuk bergabung dengan ribuan pelari.`,
    `Jadwalkan kalender Anda: ${event.title} dilaksanakan pada ${formattedDate} di ${event.city}.`,
  ]

  return pickTemplate(templates, fallback)
}

/**
 * Generate answer untuk cara mendaftar
 */
const generateDaftarAnswer = (event: EventData): string => {
  const fallback = `Pendaftaran ${event.title} dilakukan secara online. Kunjungi halaman event ini dan klik tombol daftar.`

  const templates = [
    `Untuk mendaftar ${event.title}, kunjungi halaman pendaftaran resmi di link berikut dan ikuti proses registrasi online. Pembayaran dapat dilakukan secara online yang aman.`,
    `Pendaftaran ${event.title} dilakukan secara online. Klik tombol "Daftar Sekarang" di halaman event ini, lengkapi data diri, lalu lakukan pembayaran.`,
    `Cara mendaftar ${event.title} sangat mudah: buka halaman pendaftaran, isi formulir, dan bayar biaya registrasi. Anda akan langsung mendapat nomor peserta.`,
  ]

  return pickTemplate(templates, fallback)
}

/**
 * Generate answer untuk benefit peserta
 */
const generateBenefitAnswer = (event: EventData): string => {
  const defaultBenefits = ['mendapatkan nomor peserta', 'bersaing untuk meraih hadiah menarik', 'menjadi bagian dari komunitas pelari']

  const fallback = `${event.title} menawarkan berbagai benefit menarik bagi peserta.`

  const templates = [
    `Dengan mengikuti ${event.title}, Anda ${defaultBenefits.join(', ')}, dan tentu saja pengalaman berlari yang tak terlupakan bersama ribuan pelari lainnya.`,
    `Benefit mengikuti ${event.title} antara lain: ${defaultBenefits.join(', ')}, serta kesempatan networking dengan sesama running enthusiast.`,
    `${event.title} menawarkan ${defaultBenefits.join(', ')}, plus kesempatan untuk test kemampuan lari Anda di event berkualitas.`,
  ]

  return pickTemplate(templates, fallback)
}

/**
 * Generate answer untuk kontak
 */
const generateKontakAnswer = (event: EventData): string => {
  let contactInfo = 'Silakan cek halaman pendaftaran untuk informasi kontak panitia.'

  if (event.contact_info) {
    const contactList: string[] = []

    if (event.contact_info.WhatsApp) {
      contactList.push(`WhatsApp: ${event.contact_info.WhatsApp}`)
    }
    if (event.contact_info.Instagram) {
      const ig = Array.isArray(event.contact_info.Instagram)
        ? event.contact_info.Instagram[0]
        : event.contact_info.Instagram
      contactList.push(`Instagram: ${ig}`)
    }
    if (event.contact_info.Email) {
      contactList.push(`Email: ${event.contact_info.Email}`)
    }

    if (contactList.length > 0) {
      contactInfo = `Hubungi panitia ${event.title} melalui: ${contactList.join(', ')}.`
    }
  }

  const fallback = `Untuk pertanyaan seputar ${event.title}, Anda dapat menghubungi panitia melalui kontak yang tersedia di halaman pendaftaran.`

  const templates = [
    contactInfo,
    `Untuk pertanyaan seputar ${event.title}, Anda dapat menghubungi panitia melalui kontak yang tersedia di halaman pendaftaran.`,
  ]

  return pickTemplate(templates, fallback)
}

/**
 * Composable untuk menggunakan event FAQ di components
 */
export const useEventFaq = () => {
  const generateFaq = (eventData: EventData): EventFaqItem[] => {
    return generateEventFaq(eventData)
  }

  return {
    generateFaq,
  }
}

