Siap. Ini adalah panduan lengkap dan final yang Anda minta.

Dokumen ini menggabungkan _semua_ riset _keyword_ Anda (v1 dan v2) ke dalam satu strategi copywriting dan SEO teknis yang utuh. Ini adalah panduan utama Anda untuk `indonesiamarathon.com`.

---

### 🏛️ Panduan SEO & Copywriting Final (indonesiamarathon.com)

Dokumen ini adalah satu-satunya sumber kebenaran (Single Source of Truth) untuk _copywriting_ halaman utama dan implementasi SEO teknis di seluruh situs.

### Bagian 1: Strategi SEO Inti

DSiap. Ini adalah rangkuman alur kerja (workflow) lengkap yang menggabungkan _copywriting_ final Anda, strategi _keyword_ (`kalender lari`, `apa itu marathon`), dan implementasi teknis menggunakan konfigurasi Nuxt SEO (`app.vue`, `useSeoMetaDynamic`, `useEventSchema`).

### Rangkuman Alur Kerja SEO & Copywriting (Final)

Strategi Anda kini lengkap. Kita menggunakan 4 level untuk mengimplementasikan SEO:

1.  **Level Global (`app.vue`):** Mengatur _template_ judul dan _meta_ teknis.
2.  **Level Halaman (`pages/`):** Mengisi _template_ dengan _copy_ dan _keyword_ spesifik.
3.  **Level Composable (`useSeoMetaDynamic`):** Alat bantu untuk mengeksekusi Level 2 dengan bersih.
4.  **Level Schema (`useEventSchema`):** Memberi tahu Google secara spesifik "ini adalah event".

---

### 1\. Fondasi Global (di `app.vue`)

Ini adalah implementasi teknis pertama Anda. `useHead` di `app.vue` akan mengatur "cetakan" untuk seluruh situs.

- **Tujuan:** Mengatur _default_ dan _template_ untuk seluruh situs.
- **File:** `app.vue`
- **Implementasi Teknis:**
  - **`titleTemplate` (Kunci SEO):** Kita menggunakan `useHead` untuk mengatur _template_ judul.
    - **Logika:** `(titleChunk) => titleChunk ? \`${titleChunk} | IndonesiaMarathon.com\` : 'IndonesiaMarathon.com - Kalender Lari & Jadwal Marathon 2025'\`
    - **Hasil:**
      - Di Halaman Detail: _Judul Halaman_ | IndonesiaMarathon.com
      - Di Homepage (jika `title` tidak diisi): IndonesiaMarathon.com - Kalender Lari & Jadwal Marathon 2025
  - **Meta Teknis:** Mengatur _favicon_, _PWA tags_ (`theme-color: '#121212'`, `apple-touch-icon`), dan _preconnect links_ ke API Laravel Anda.

---

### 2\. Halaman Utama (Homepage) (di `pages/index.vue`)

Ini adalah tempat di mana _copywriting_ utama dan _keyword_ bervolume tertinggi bertemu.

- **Tujuan:** Menangkap _keyword_ utama dan mengonversi pengguna.
- **Target Keyword:** `Kalender Lari 2025`, `Jadwal Marathon`, `Event Running`, `Fun Run`, `Apa itu Pace`.
- **Implementasi Teknis:**
  1.  **Copywriting:** Anda menulis _copy_ di _template_ (Hero, CTA, Blog Section) persis seperti dokumen **"Referensi Copywriting & SEO (Final)"** yang telah kita setujui.
      - `H1`: `Kalender Lari & Jadwal Marathon 2025 Terlengkap di Indonesia`
      - `Headline Blog`: `Pahami Lari: Apa itu Pace, Cut Off, dan Marathon?`
  2.  **SEO Meta:** Anda memanggil _composable_ `useSeoMetaDynamic` di dalam `<script setup>`:
      ```javascript
      useSeoMetaDynamic({
        title: 'Kalender Lari 2025 & Jadwal Event Running Indonesia',
        description:
          'Temukan jadwal lari 2025 terlengkap, event running, fun run, trail run, & marathon di seluruh Indonesia...',
        type: 'website',
      })
      ```
  3.  **Hasil:** `useSeoMetaDynamic` mengambil ini dan (dikombinasikan dengan `app.vue`) menghasilkan _title_ HTML: `<title>Kalender Lari 2025 & Jadwal Event Running Indonesia | IndonesiaMarathon.com</title>`.

---

### 3\. Halaman Detail Event (di `pages/event/[slug].vue`)

Ini adalah implementasi SEO paling teknis dan penting untuk _long-tail_ event.

- **Tujuan:** Memberi Google semua detail spesifik event (SEO + Schema).
- **Target Keyword:** Nama event spesifik (e.g., `Borobudur Marathon 2025`, `Jakarta Marathon 2025`).
- **Implementasi Teknis:**
  1.  **Ambil Data API:** Anda mem-fetch data `event` dari Laravel. Data ini sudah termasuk `event.seo_title` dan `event.seo_description` yang diisi admin via `filament-seo`.
  2.  **SEO Meta:** Anda memanggil `useSeoMetaDynamic`:
      ```javascript
      useSeoMetaDynamic({
        title: event.value.seo_title, // <-- Data dari API
        description: event.value.seo_description, // <-- Data dari API
        image: event.value.poster_webp_url, // <-- Data dari Spatie
        type: 'article',
        publishedTime: event.value.created_at,
      })
      ```
  3.  **Schema.org (Kritis):** Anda memanggil `useEventSchema` untuk memberi tahu Google "Ini adalah event":
      ```javascript
      useEventSchema({
        name: event.value.title,
        startDate: event.value.event_date,
        location: {
          name: event.value.location_name,
          address: {
            addressLocality: event.value.city,
            addressCountry: 'ID'
          }
        },
        offers: [...] // data harga dari event.registration_fees
      })
      ```

---

### 4\. Halaman Blog & Pillar Page (di `pages/blog/[slug].vue`)

Ini adalah cara Anda memenangkan _keyword_ informasional (pertanyaan).

- **Tujuan:** Menangkap _traffic_ dari pengguna yang mencari jawaban.
- **Target Keyword:** `apa itu marathon`, `half marathon berapa km`, `pace adalah`, `cut off adalah`, `trail run adalah`, `lari maraton adalah`, `macam macam lari`.
- **Implementasi Teknis:**
  1.  **Tulis Artikel:** Anda (atau admin) membuat artikel di Filament berdasarkan **"Strategi Konten Blog & Pillar Page (Final)"** (e.g., "Panduan Marathon Lengkap: Apa Itu Marathon dan Berapa Jarak Larinya?").
  2.  **SEO Meta:** Halaman ini mirip dengan Halaman Event:
      ```javascript
      useSeoMetaDynamic({
        title: post.value.seo_title, // <-- Data dari API
        description: post.value.seo_description, // <-- Data dari API
        type: 'article',
        publishedTime: post.value.published_at,
      })
      ```
  3.  **Schema.org:** Anda memanggil `useSchemaOrg([defineArticle({...})])` (bawaan `@nuxtjs/seo`) untuk menandai ini sebagai artikel.

---

### 5\. Halaman Kategori Dinamis (di `pages/agenda-lari/[kategori].vue`)

Ini adalah cara Anda menangkap _keyword_ lokal dan kategori secara otomatis.

- **Tujuan:** Membuat halaman arahan (landing page) untuk setiap kategori/kota.
- **Target Keyword:** `event marathon`, `event fun run`, `event lari bandung`, `event lari surabaya 2025`.
- **Implementasi Teknis:**
  1.  **Deteksi Kategori:** Anda membaca `route.params.kategori` (misal: "marathon" atau "bandung").
  2.  **Buat Judul Dinamis:** Anda membuat _title_ secara programatik, e.g., `const pageTitle = 'Kalender Event Lari ' + kategoriSlug + ' 2025'`.
  3.  **SEO Meta:** Anda memanggil `useSeoMetaDynamic` dengan judul yang baru Anda buat:
      ```javascript
      useSeoMetaDynamic({
        title: pageTitle, // e.g., "Kalender Event Lari Bandung 2025"
        description: `Temukan jadwal event lari terbaru di ${kategoriSlug}...`,
      })
      ```
  4.  **Hasil:** Anda kini memiliki ratusan halaman yang menargetkan SEO lokal (`.../bandung`, `.../jakarta`, dll.) tanpa perlu membuatnya secara manual.

---

### Bagian 2: Referensi Copywriting Homepage (Final)

Gunakan _copy_ ini untuk `pages/index.vue` Anda. Ini sudah dioptimalkan untuk SEO dan _brand_.

#### 1\. Hero Section

- **Badge:** `Platform Digital #1 Event Lari Indonesia`
- **Headline (H1):** `Kalender Lari & Jadwal Marathon 2025 Terlengkap di Indonesia`
- **Subheadline:** `Jelajahi jadwal lari 2025 terlengkap dari IndonesiaMarathon.com: temukan event running favorit, fun run seru, dan direktori vendor lari.`
- **CTA Primer:** `Eksplor Kalender Lari`
- **CTA Sekunder:** `Lihat Promo Partner`

#### 2\. CTA Section (Kolaborasi)

Ini adalah copy baru yang menggabungkan headline modern dengan bullet points yang sudah diperkuat.

Badge: Kolaborasi Dengan Kami

Headline: Naik kelas bersama IndonesiaMarathon.com.

Subheadline: Promosikan event lari Anda di platform #1 untuk running event di Indonesia. Ini alasan mengapa kami adalah partner terbaik untuk pertumbuhan event Anda:

Poin-Poin Keunggulan (Bullets):

Visibilitas SEO Maksimal Event Anda otomatis muncul di Google saat pelari mencari "jadwal lari", "kalender marathon", atau "event lari 2025".

Audiens Instan & Tertarget Terhubung langsung dengan puluhan ribu pelari aktif di komunitas kami yang siap mencari dan mendaftar event baru.

Jangkauan Multi-Platform Promosi tidak hanya di web, tapi juga di media sosial (Instagram, TikTok) kami yang terkurasi khusus untuk komunitas lari.

Data Performa Transparan Pantau klik, impresi, dan konversi pendaftaran event Anda melalui dasbor partner yang transparan.

CTA Primer: Lihat Rate Card

CTA Sekunder: Hubungi Tim Kami

#### 3\. Event Type Section (Kategori)

- **Badge:** `Kurasi Jenis Event`
- **Headline:** `Dari Fun Run Santai hingga Marathon Penuh Tantangan`
- **Subheadline:** `Pilih kategori running event favoritmu: temukan jadwal trail run terdekat, half marathon berikutnya, atau fun run di kotamu.`
- **CTA Global:** `Lihat Semua`
- **CTA Kartu:** `Lihat Semua {{ eventType.name }}` (Contoh: "Lihat Semua Fun Run")

#### 4\. Latest Events Section (Event Terbaru)

- **Badge:** `Update Jadwal Lari Terbaru`
- **Headline:** `Jadwal Lari & Event Running Terbaru`
- **Subheadline:** `Kalender lari ini terus di-update setiap hari. Cek event running 2025 terbaru yang baru masuk dan tandai jadwalmu berikutnya.`
- **CTA Global:** `Lihat Semua Event`
- **Empty State:** `Belum ada event terbaru — pantau terus untuk pembaruan selanjutnya.`

#### 5\. Blog Section (Artikel)

- **Badge:** `Artikel Terbaru`
- **Headline:** `Pahami Lari: Apa itu Pace, Cut Off, dan Marathon?`
- **Subheadline:** `Upgrade pengetahuan lari kamu. Pelajari tips trail running, apa artinya fun run, hingga cara menghitung pace lari idealmu di sini.`
- **CTA Global:** `Semua Artikel`
- **Empty State:** `Belum ada artikel tersedia.`

---

### Bagian 3: Panduan Implementasi SEO Teknis (Nuxt)

Ini adalah cara Anda mengkombinasikan `useHead` dan modul `@nuxtjs/seo` (`useSeoMeta`, `useSchemaOrg`).

#### 3.1. Global: `app.vue` (Mengatur Template & Default)

File `app.vue` Anda mengatur _default_ untuk seluruh situs, seperti _title template_ dan _favicon_.

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const config = useRuntimeConfig()
const apiBaseUrl = config.public.apiBase || 'http://localhost:8000'

useHead({
  // 1. TEMPLATE JUDUL (SANGAT PENTING)
  // Menambahkan "| IndonesiaMarathon.com" ke semua judul halaman
  // dan menetapkan judul homepage default yang kuat.
  titleTemplate: titleChunk => {
    return titleChunk
      ? `${titleChunk} | IndonesiaMarathon.com`
      : 'IndonesiaMarathon.com - Kalender Lari & Jadwal Marathon 2025'
  },

  htmlAttrs: {
    lang: 'id',
  },

  meta: [
    // 2. META TEKNIS & PWA
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'referrer', content: 'no-referrer-when-downgrade' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'IndoMarathon' }, // Nama pendek PWA

    // 3. WARNA TEMA (Sesuai UI Playbook)
    { name: 'msapplication-TileColor', content: '#121212' }, // Primary
    { name: 'theme-color', content: '#121212' }, // Primary
    { name: 'color-scheme', content: 'dark light' },
  ],

  link: [
    // 4. FAVICONS & MANIFEST
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'manifest', href: '/site.webmanifest' },

    // 5. PRECONNECT (Kritis untuk Performa)
    // Preconnect ke API Backend Laravel Anda
    { rel: 'preconnect', href: new URL(apiBaseUrl).origin, crossorigin: 'anonymous' },
    { rel: 'dns-prefetch', href: new URL(apiBaseUrl).origin },
  ],
})
</script>
```

#### 3.2. Halaman Utama: `pages/index.vue` (Mengisi Template)

Halaman ini menggunakan `useSeoMeta` untuk mengisi _title_ dan _meta_ spesifik homepage, berdasarkan copywriting dari **Bagian 2**.

```vue
<template>
  <div></div>
</template>

<script setup>
const config = useRuntimeConfig()

// --- Data dari Copywriting Bagian 2 ---
const pageTitle = 'Kalender Lari 2025 & Jadwal Event Running Indonesia'
const pageDescription =
  'Temukan jadwal lari 2025 terlengkap, event running, fun run, trail run, & marathon di seluruh Indonesia. Filter event lari terbaru di kotamu.'
// ------------------------------------

const defaultOgImage = `${config.public.siteUrl || 'http://localhost:3000'}/og-default.webp`

useSeoMeta({
  // Title akan menjadi: "Kalender Lari... | IndonesiaMarathon.com"
  title: pageTitle,
  description: pageDescription,

  // --- Open Graph (OG) ---
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage: defaultOgImage,
  ogUrl: config.public.siteUrl, // URL kanonis homepage

  // --- Twitter Card ---
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: defaultOgImage,

  // Catatan: og:site_name, og:type, twitter:card, dll.
  // sudah diatur otomatis oleh @nuxtjs/seo di nuxt.config.js
})
</script>
```

#### 3.3. Halaman Dinamis: `pages/event/[slug].vue` (SEO & Schema)

Ini adalah halaman paling penting untuk SEO detail. Kita menggunakan data dari `filament-seo` dan `useSchemaOrg`.

```vue
<template>
  <div></div>
</template>

<script setup>
const route = useRoute()
const config = useRuntimeConfig()

// 1. Ambil data event dari API
const { data: event, error } = await useFetch(
  `${config.public.apiBase}/events/${route.params.slug}`
)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event tidak ditemukan', fatal: true })
}

// 2. Siapkan data SEO (dari API / filament-seo)
const seoTitle = event.value.seo_title || event.value.title
const seoDescription = event.value.seo_description || event.value.description.substring(0, 155)
const eventImage = event.value.poster_webp_url || `${config.public.siteUrl}/og-default.webp`

// 3. Gunakan useSeoMeta
useSeoMeta({
  title: seoTitle, // Akan menjadi: "[Nama Event] | IndonesiaMarathon.com"
  description: seoDescription,

  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: eventImage,
  ogUrl: `${config.public.siteUrl}/event/${event.value.slug}`,

  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: eventImage,
})

// 4. (WAJIB) Gunakan Schema.org untuk Event
useSchemaOrg([
  defineEvent({
    name: event.value.title,
    startDate: event.value.event_date,
    endDate: event.value.event_end_date || event.value.event_date,
    description: seoDescription,
    image: eventImage,
    location: {
      '@type': 'Place',
      name: event.value.location_name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.value.city,
        addressCountry: 'ID',
      },
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      url: event.value.registration_url,
      availability: 'https://schema.org/InStock',
    },
  }),
])
</script>
```

#### 3.4. Halaman Kategori: `pages/agenda-lari/[kategori].vue` (Menangkap SEO Lokal & Kategori)

Halaman ini akan menangkap _keyword_ seperti "event marathon", "borobudur marathon", "event lari bandung".

```vue
<template>
  <div>
    <h1>{{ pageTitle }}</h1>
  </div>
</template>

<script setup>
const route = useRoute()
const config = useRuntimeConfig()
const kategoriSlug = route.params.kategori // misal: "marathon" atau "bandung"

// Logika untuk membuat judul & deskripsi dinamis
// (Ini harus lebih canggih di produksi, mungkin dari API)
let pageTitle = `Jadwal Event Lari ${kategoriSlug}`
let pageDescription = `Temukan kalender event lari untuk kategori ${kategoriSlug} di Indonesia.`

if (kategoriSlug === 'marathon') {
  pageTitle = 'Jadwal & Kalender Event Marathon 2025 di Indonesia'
  pageDescription =
    'Temukan jadwal event marathon 2025. Filter Borobudur Marathon, Jakarta Marathon, dan lari marathon lainnya.'
}
if (kategoriSlug === 'bandung') {
  pageTitle = 'Kalender Event Lari Bandung 2025'
  pageDescription =
    'Daftar jadwal event lari terbaru di Bandung untuk 2025. Temukan fun run, trail run, dan marathon di Bandung.'
}
// ...
// ... (logika lain untuk kategori/kota yang berbeda)
// ...

useSeoMeta({
  title: pageTitle, // Akan menjadi: "[Judul Dinamis] | IndonesiaMarathon.com"
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
})
</script>
```

---

### Bagian 4: Strategi Konten Blog & Pillar Page (Final)

Ini adalah _backlog_ konten prioritas Anda untuk memenangkan _semua keyword_ informasional yang telah Anda riset.

- **Prioritas 1 (Pillar Page Marathon):**
  - **Judul:** `Panduan Marathon Lengkap: Apa Itu Marathon dan Berapa Jarak Larinya?`
  - **Slug:** `/blog/apa-itu-marathon-jarak-lari`
  - **Target:** `marathon`, `apa itu marathon`, `marathon berapa km`, `half marathon`, `half marathon berapa km`, `apa itu half marathon`, `macam macam lari`.

- **Prioritas 2 (Pillar Page Pace):**
  - **Judul:** `Pace Adalah: Panduan Lengkap Cara Menghitung Pace Lari 5, 10, dst.`
  - **Slug:** `/blog/pace-adalah-cara-menghitung`
  - **Target:** `pace adalah`, `artinya pace`, `pace 5 berapa km jam`, dll.

- **Prioritas 3 (Artikel Pendukung):**
  - **Judul:** `Fun Run Artinya Apa? Ini Bedanya dengan Event Lari Biasa`
  - **Slug:** `/blog/fun-run-artinya`
  - **Target:** `fun run`, `fun run artinya`.

- **Prioritas 4 (Artikel Pendukung):**
  - **Judul:** `Cut Off Adalah: Pahami Batas Waktu (COT) dalam Event Lari Marathon`
  - **Slug:** `/blog/cut-off-adalah`
  - **Target:** `cut off adalah`.

- **Prioritas 5 (Artikel Pendukung):**
  - **Judul:** `Panduan Trail Running untuk Pemula: Apa Itu Trail Run?`
  - **Slug:** `/blog/panduan-trail-running-pemula`
  - **Target:** `trail run`, `trail running`, `trail run adalah`.

---

## Bagian 5: Dokumentasi Key Dinamis (Page Header & Ad Banner)

Agar integrasi backend ↔ frontend tetap sinkron, gunakan daftar key berikut saat mengelola Site Setting, Static Page, dan Ad Banner. Semua key sudah disediakan oleh `SiteSettingSeeder.php`, `StaticPageSeeder.php`, dan `AdBannerSeeder.php`.

### 5.1 Site Setting Keys

| Key                           | Fungsi                             | Frontend Usage                                      |
| ----------------------------- | ---------------------------------- | --------------------------------------------------- |
| `header_bg_events`            | Background default halaman event   | `pages/event/index.vue`, fallback di banyak halaman |
| `header_bg_blog`              | Background halaman blog            | `pages/blog/index.vue`, `pages/blog/[slug].vue`     |
| `header_bg_ekosistem`         | Background halaman induk ekosistem | `pages/ekosistem/index.vue`                         |
| `header_bg_komunitas`         | Background direktori komunitas     | `pages/ekosistem/komunitas-lari.vue`                |
| `header_bg_race_management`   | Background race management         | `pages/ekosistem/race-management.vue`               |
| `header_bg_vendor_medali`     | Background vendor medali           | `pages/ekosistem/vendor-medali.vue`                 |
| `header_bg_vendor_jersey`     | Background vendor jersey           | `pages/ekosistem/vendor-jersey.vue`                 |
| `header_bg_vendor_fotografer` | Background vendor fotografer       | `pages/ekosistem/vendor-fotografer.vue`             |
| `header_bg_faq`               | Background halaman FAQ             | `pages/faq.vue` (fallback ke event jika kosong)     |
| `header_bg_rate_card`         | Background halaman Rate Card       | `pages/rate-card.vue`                               |
| `contact_email`               | CTA email Rate Card & kontak       | `pages/rate-card.vue`, `components/footer`          |
| `contact_whatsapp`            | CTA WhatsApp Rate Card             | Diproses dengan `buildWhatsappUrl`                  |

> Semua key diakses via `useSiteSettings().getImage(key)` atau `getSetting(key)`. `PageHeader.vue` menerima prop `background-image-url` dari key-key ini sebagai fallback jika tidak ada banner aktif.

### 5.2 Ad Banner Slot Keys

Seeder `AdBannerSeeder.php` membuat slot yang dipakai oleh composable `useAdBanners.ts`:

| Slot Location (Desktop / Mobile)                | Halaman                | File Nuxt                               |
| ----------------------------------------------- | ---------------------- | --------------------------------------- |
| `homepage_slider` (desktop only), `banner_main` / `_mobile`, `sidebar_1/2` / `_mobile` | Homepage hero & widget | (WIP) |
| `page_header_events` / `page_header_events_mobile` | Event index         | `pages/event/index.vue`                 |
| `page_header_event_detail` / `_mobile`          | Event detail           | `pages/event/[slug].vue`                |
| `page_header_blog` / `_mobile`                  | Blog index             | `pages/blog/index.vue`                  |
| `page_header_blog_detail` / `_mobile`           | Blog detail            | `pages/blog/[slug].vue`                 |
| `page_header_faq` / `_mobile`                   | FAQ                    | `pages/faq.vue`                         |
| `page_header_ekosistem` / `_mobile`             | Ekosistem index        | `pages/ekosistem/index.vue`             |
| `page_header_komunitas` / `_mobile`             | Komunitas lari         | `pages/ekosistem/komunitas-lari.vue`    |
| `page_header_race_management` / `_mobile`       | Race management        | `pages/ekosistem/race-management.vue`   |
| `page_header_vendor_medali` / `_mobile`         | Vendor medali          | `pages/ekosistem/vendor-medali.vue`     |
| `page_header_vendor_jersey` / `_mobile`         | Vendor jersey          | `pages/ekosistem/vendor-jersey.vue`     |
| `page_header_vendor_fotografer` / `_mobile`     | Vendor fotografer      | `pages/ekosistem/vendor-fotografer.vue` |
| `page_header_rate_card` / `_mobile`             | Rate Card              | `pages/rate-card.vue`                   |

> **Alur:** `useAdBanners().fetchResponsiveBanners(slot)` → `PageHeader.vue`. Prop `ad-banners` menerima array desktop (default), sedangkan `ad-banners-mobile` otomatis memakai slot `<slot>_mobile` bila tersedia (fallback ke desktop jika kosong). Jadi Anda tinggal menambahkan banner khusus mobile di slot `_mobile` tanpa mengubah konfigurasi default desktop.

### 5.3 Static Page `rate-card`

`StaticPageSeeder` menambahkan konten edukasi Rate Card dengan `slug: rate-card`. Frontend (`pages/rate-card.vue`) mem-fetch konten ini via `/pages/rate-card` untuk memastikan copy pembuka bisa diedit dari panel admin tanpa rebuild.

### 5.4 Best Practice Sinkronisasi

1. **Tambah Header Baru:** update `SiteSetting::KEY_DEFINITIONS`, seeder terkait, dan gunakan `getImage('header_bg_xxx')` di halaman Nuxt.
2. **Tambahkan Slot Banner:** daftarkan slug baru di `AdBannerSeeder.php` (serta varian `_mobile` jika butuh tampilan mobile), kemudian panggil `fetchResponsiveBanners('slot_baru')` pada halaman Nuxt terkait.
3. **Fallback Aman:** pastikan setiap halaman memanggil `getImage('header_bg_events', null)` sebagai cadangan terakhir agar PageHeader selalu memiliki latar.
4. **Testing:** lakukan `php artisan migrate:fresh --seed` saat menambahkan key baru agar Media Library & seed image ikut terpasang.

Dengan dokumentasi ini, tim bisa menelusuri hubungan key antara Laravel dan Nuxt dengan cepat serta menghindari mismatch slot/header ketika menambah landing page baru.
