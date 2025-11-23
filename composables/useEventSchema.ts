/**
 * Composable untuk generate Event Schema.org markup
 * Sesuai dengan rekomendasi SEO: "Terapkan Event Schema secara ketat di semua halaman di silo /event/"
 *
 * @see https://schema.org/Event
 */
export interface EventSchemaData {
  name: string
  description: string
  startDate: string // ISO 8601 format
  endDate?: string // ISO 8601 format
  location: {
    name: string
    address: {
      streetAddress?: string // Alamat lengkap/jalan (Penting untuk Maps)
      addressLocality: string // Kota/Kabupaten
      addressRegion?: string // Provinsi (Penting untuk SEO Lokal)
      addressCountry: 'ID'
    }
  }
  image?: string
  organizer?: {
    name: string
    url?: string
  }
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed'
  eventAttendanceMode?:
    | 'OfflineEventAttendanceMode'
    | 'OnlineEventAttendanceMode'
    | 'MixedEventAttendanceMode'
  offers?: {
    price: string | number
    priceCurrency: 'IDR'
    availability?: 'InStock' | 'SoldOut' | 'PreOrder'
    url?: string
    validFrom?: string
  }[]
  performer?: {
    name: string
  }
  url?: string
}

/**
 * Best Practice Refactor:
 * - Menggunakan `defineEvent` dari `nuxt-schema-org`.
 * - Menambahkan FALLBACK VALUES untuk memastikan validitas Rich Results Google.
 * - Menambahkan detail lokasi (Provinsi & Jalan) untuk Local SEO.
 */
export const useEventSchema = (eventData: EventSchemaData) => {
  useSchemaOrg([
    defineEvent({
      name: eventData.name,
      description: eventData.description,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      url: eventData.url,
      image: eventData.image,
      
      // OPTIMASI 1: Default Values untuk Status & Mode
      // Mayoritas event lari adalah Terjadwal dan Offline.
      eventStatus: eventData.eventStatus
        ? `https://schema.org/${eventData.eventStatus}`
        : 'https://schema.org/EventScheduled',
        
      eventAttendanceMode: eventData.eventAttendanceMode
        ? `https://schema.org/${eventData.eventAttendanceMode}`
        : 'https://schema.org/OfflineEventAttendanceMode',

      // OPTIMASI 2: Detail Lokasi Lengkap
      location: {
        '@type': 'Place',
        name: eventData.location.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: eventData.location.address.streetAddress,
          addressLocality: eventData.location.address.addressLocality,
          addressRegion: eventData.location.address.addressRegion, // Kritis untuk query "Lari di Jawa Barat"
          addressCountry: 'ID',
        },
      },

      ...(eventData.organizer && {
        organizer: {
          '@type': 'Organization',
          name: eventData.organizer.name,
          url: eventData.organizer.url,
        },
      }),

      ...(eventData.performer && {
        performer: {
          '@type': 'PerformingGroup',
          name: eventData.performer.name,
        },
      }),

      // OPTIMASI 3: Validitas Offers
      ...(eventData.offers &&
        eventData.offers.length > 0 && {
          offers: eventData.offers.map(offer => ({
            '@type': 'Offer',
            price: offer.price,
            priceCurrency: 'IDR',
            availability: offer.availability
              ? `https://schema.org/${offer.availability}`
              : 'https://schema.org/InStock', // Default ke InStock jika null
            url: offer.url || eventData.url, // Fallback ke URL event jika URL tiket kosong
            validFrom: offer.validFrom,
          })),
        }),
    }),
  ])
}
