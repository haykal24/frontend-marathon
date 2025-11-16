# SEO & Copywriting Implementation Notes

## Tahun Dinamis (Dynamic Year)

Semua copywriting di section-section telah di-update untuk menggunakan tahun dinamis menggunakan composable `useCurrentYear()`. Ini memastikan bahwa tahun tidak perlu di-update secara manual setiap tahunnya.

### Implementasi Dynamic Year

**File:** `frontend/composables/useCurrentYear.ts`

```typescript
import { computed } from 'vue'

export const useCurrentYear = () => {
  const currentYear = computed(() => new Date().getFullYear())
  return { currentYear }
}
```

### Section yang Sudah Di-Update

Berikut adalah daftar semua section yang sudah mengimplementasikan dynamic year di copywriting-nya:

#### 1. **Hero Section** (`HeroSection.vue`)

- **Title:** "Kalender Lari & Jadwal Marathon {{ currentYear }} Terlengkap di Indonesia"
- **Description:** "Jelajahi jadwal lari {{ currentYear }} terlengkap dari IndonesiaMarathon.com..."

#### 2. **Event Type Section** (`EventTypeSection.vue`)

- **Description:** "Pilih kategori running event {{ currentYear }} favoritmu: temukan jadwal trail run terdekat, half marathon berikutnya, atau fun run di kotamu."

#### 3. **Event Latest Section** (`EventLatestSection.vue`)

- **Title:** "Jadwal Lari & Event Running Terbaru"
- **Description:** "Kalender lari ini terus di-update setiap hari. Cek event running {{ currentYear }} terbaru yang baru masuk dan tandai jadwalmu berikutnya."

#### 4. **Blog Section** (`BlogSection.vue`)

- **Title:** "Pahami Lari: Apa itu Pace, Cut Off, dan Marathon?"
- **Description:** "Upgrade pengetahuan lari kamu untuk tahun {{ currentYear }}. Pelajari tips trail running, apa artinya fun run, hingga cara menghitung pace lari idealmu di sini."

#### 5. **Calendar Section** (`CalendarSection.vue`)

- **Title:** "Kalender Event Lari {{ currentYear }}"
- **Description:** "Jelajahi jadwal event lari sepanjang tahun {{ currentYear }}. Temukan event running di bulanmu dan catat race favorit untuk persiapan terbaik."

#### 6. **Province Section** (`ProvinceSection.vue`)

- **Title:** "Event Lari di Berbagai Provinsi Indonesia"
- **Description:** "Temukan event running terbaru di provinsi pilihan kamu. Daftar sekarang dan bergabung dengan ribuan pelari lainnya di event favorit {{ currentYear }}."

#### 7. **Ad Banner Section** (`AdBannerSection.vue`)

- **Title:** "Penawaran Spesial dari Partner"
- **Description:** "Temukan penawaran eksklusif dari partner terpercaya komunitas lari. Hemat untuk persiapan event lari terbaik kamu."

---

## SEO & Technical Implementation

### 1. **Global Head Configuration** (`app.vue`)

Mengatur template judul global untuk semua halaman:

```vue
titleTemplate: (titleChunk) => { return titleChunk ? `${titleChunk} | IndonesiaMarathon.com` :
'IndonesiaMarathon.com - Kalender Lari & Jadwal Marathon 2025' }
```

### 2. **PWA & Meta Tags**

- `theme-color: #121212` (Primary color)
- `viewport: width=device-width, initial-scale=1, viewport-fit=cover`
- Apple touch icon support
- Manifest file support

### 3. **Preconnect & DNS Prefetch**

Mengoptimalkan koneksi ke API Backend:

```vue
link: [ { rel: 'preconnect', href: apiBaseUrl, crossorigin: 'anonymous' }, { rel: 'dns-prefetch',
href: apiBaseUrl } ]
```

---

## Copywriting Reference

Seluruh copywriting sudah disesuaikan dengan Panduan SEO & Copywriting Final yang ada di `.cursor/rules/panduanseo.mdc`.

### Badge Standardization

- ✓ "Platform Digital #1 Event Lari Indonesia" (Hero)
- ✓ "Kolaborasi Dengan Kami" (CTA)
- ✓ "Kurasi Jenis Event" (Event Type)
- ✓ "Update Jadwal Lari Terbaru" (Event Latest)
- ✓ "Artikel Terbaru" (Blog)
- ✓ "Kalender Event Nasional" (Calendar)
- ✓ "Cari Event Lari Lokal" (Province)
- ✓ "Kolaborasi Partner" (Ad Banner)

---

## Notes

- Semua dynamic year menggunakan `useCurrentYear()` composable
- Tahun akan otomatis ter-update tanpa perlu manual change
- Format copywriting sudah mengikuti panduan yang ditetapkan
- SEO optimization sudah diterapkan di global level (`app.vue`)
