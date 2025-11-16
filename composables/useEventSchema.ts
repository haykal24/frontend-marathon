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
      addressLocality: string // City
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
    price: string
    priceCurrency: 'IDR'
    availability?: string
    url?: string
  }[]
  performer?: {
    // Tambahkan performer jika ada, misal: guest star
    name: string
  }
  category?: string
  url?: string
}

/**
 * Best Practice Refactor:
 * - Menggunakan `defineEvent` dari `nuxt-schema-org` (bagian dari @nuxtjs/seo).
 * - Menghapus pembuatan objek schema manual dan injeksi script fallback.
 * - Lebih type-safe, ringkas, dan sesuai dengan ekosistem Nuxt.
 */
export const useEventSchema = (eventData: EventSchemaData) => {
  // Langsung panggil useSchemaOrg dengan defineEvent
  useSchemaOrg([
    defineEvent({
      name: eventData.name,
      description: eventData.description,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      url: eventData.url,
      image: eventData.image,
      eventStatus: eventData.eventStatus
        ? `https://schema.org/${eventData.eventStatus}`
        : undefined,
      eventAttendanceMode: eventData.eventAttendanceMode
        ? `https://schema.org/${eventData.eventAttendanceMode}`
        : undefined,

      location: {
        '@type': 'Place',
        name: eventData.location.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: eventData.location.address.addressLocality,
          addressCountry: eventData.location.address.addressCountry,
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

      ...(eventData.offers &&
        eventData.offers.length > 0 && {
          offers: eventData.offers.map(offer => ({
            '@type': 'Offer',
            price: offer.price,
            priceCurrency: offer.priceCurrency,
            availability: offer.availability
              ? `https://schema.org/${offer.availability}`
              : undefined,
            url: offer.url,
          })),
        }),
    }),
  ])
}
