# 📐 Dokumentasi Ukuran Gambar - indonesiamarathon.com

Dokumentasi lengkap ukuran gambar untuk semua elemen UI di platform indonesiamarathon.com. Gunakan referensi ini saat mendesain gambar untuk web.

---

## 📋 Daftar Isi

1. [Banner & Hero Section](#1-banner--hero-section)
2. [Event Images](#2-event-images)
3. [Blog Images](#3-blog-images)
4. [Logo & Branding](#4-logo--branding)
5. [Social Media & OG Images](#5-social-media--og-images)
6. [Best Practices](#6-best-practices)

---

## 1. Banner & Hero Section

### 📍 Slot Locations Overview

Sistem banner menggunakan **slot-based architecture** untuk fleksibilitas penempatan:

**Homepage Slots:**
- `homepage_slider` - Hero slider di homepage (tidak ada varian mobile)
- `banner_main` - Banner utama di homepage (ada varian `_mobile`)
- `sidebar_1` - Sidebar banner pertama (ada varian `_mobile`)
- `sidebar_2` - Sidebar banner kedua (ada varian `_mobile`)

**Page Header Slots:**
- `page_header_*` - Header banner untuk berbagai halaman (ada varian `_mobile` untuk semua)

**Catatan Penting:**
- Semua slot (kecuali `homepage_slider`) memiliki varian mobile dengan suffix `_mobile`
- Jika varian mobile tidak ada, sistem akan fallback ke desktop banner
- Backend (Spatie Media Library) otomatis generate multiple sizes

### 1.1. Hero Slider (Homepage)
**Lokasi:** `components/sections/HeroSection.vue`  
**Slot Location:** `homepage_slider`

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Desktop** | 1920 × 1080 | 16:9 | WebP | 75% | Full HD untuk hero slider |
| **Mobile** | 1920 × 1080 | 16:9 | WebP | 75% | Sama dengan desktop (akan di-resize otomatis) |
| **Preload** | 1600 × 900 | 16:9 | WebP | 75% | Untuk preload image pertama (LCP optimization) |

**Dimensi Container:**
- Desktop: `h-screen` (100% viewport height)
- Mobile: `min-h-screen` (minimum 100% viewport height)

**Catatan:**
- Hero slider menggunakan full viewport height
- Gambar akan di-crop secara otomatis dengan `object-cover`
- Pastikan elemen penting berada di tengah (center-safe area 80%)
- **TIDAK ada varian mobile** untuk `homepage_slider` (menggunakan gambar yang sama)
- Backend generate: 1920×1080 (webp) via Spatie Media Library

---

### 1.2. Banner Promo (Ad Banner Section)
**Lokasi:** `components/sections/AdBannerSection.vue`  
**Slot Locations:** `banner_main`, `sidebar_1`, `sidebar_2`

#### Banner Utama (Main Banner)
**Slot:** `banner_main` (Desktop) dan `banner_main_mobile` (Mobile)

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Desktop** | 1920 × 640 | 3:1 | WebP | 75% | Banner utama di homepage (2/3 lebar container) |
| **Mobile** | 1200 × 720 | 5:3 | WebP | 70% | Banner mobile (full width, slider) |

**Dimensi Container:**
- Desktop: `min-h-[420px]` (minimum height, bisa lebih tinggi)
- Mobile: `h-72` (288px fixed height)

**Catatan:**
- Banner utama menempati 2/3 lebar container di desktop
- Jika ada multiple banners, akan ditampilkan sebagai slider
- Backend generate: 1920×1080 (webp) dan 800×600 (mobile) via Spatie

#### Banner Sidebar
**Slot:** `sidebar_1` / `sidebar_2` (Desktop) dan `sidebar_1_mobile` / `sidebar_2_mobile` (Mobile)

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Desktop** | 900 × 400 | 9:4 | WebP | 70% | Banner sidebar (1/3 lebar container) |
| **Mobile** | 1200 × 720 | 5:3 | WebP | 70% | Sama dengan main banner (digabung dalam slider) |

**Dimensi Container:**
- Desktop: `min-h-[200px]` per slot (2 slot vertikal, total `min-h-[420px]`)
- Mobile: `h-72` (288px fixed height, digabung dengan main banner)

**Layout Desktop:**
```
┌─────────────────────────┬──────────┐
│                         │ Sidebar 1│
│   Banner Main           │ (200px+) │
│   (420px+ height)       ├──────────┤
│                         │ Sidebar 2│
│                         │ (200px+) │
└─────────────────────────┴──────────┘
```

**Layout Mobile:**
```
┌─────────────────────────┐
│  Combined Slider         │
│  (288px height)         │
│  - Main + Sidebar 1+2   │
└─────────────────────────┘
```

---

### 1.3. Page Header Banner
**Lokasi:** `components/layout/PageHeader.vue`  
**Slot Locations:** `page_header_*` (lihat daftar lengkap di bawah)

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Desktop** | 1920 × 1080 | 16:9 | WebP | 80% | Background header halaman (quality lebih tinggi untuk header) |
| **Mobile** | 1920 × 1080 | 16:9 | WebP | 80% | Sama dengan desktop |

**Dimensi Container:**
- Desktop: `h-[60vh]` (60% viewport height)
- Mobile: `h-[60vh]` (60% viewport height)

**Slot Locations yang Tersedia:**
- `page_header_events` - Header halaman listing event
- `page_header_event_detail` - Header halaman detail event
- `page_header_blog` - Header halaman listing blog
- `page_header_blog_detail` - Header halaman detail blog
- `page_header_faq` - Header halaman FAQ
- `page_header_ekosistem` - Header halaman ekosistem
- `page_header_komunitas` - Header direktori komunitas
- `page_header_race_management` - Header direktori race management
- `page_header_vendor_medali` - Header direktori vendor medali
- `page_header_vendor_jersey` - Header direktori vendor jersey
- `page_header_vendor_fotografer` - Header direktori vendor fotografer
- `page_header_rate_card` - Header halaman rate card

**Catatan:**
- Setiap slot memiliki varian `_mobile` (contoh: `page_header_events_mobile`)
- Jika tidak ada banner mobile, akan fallback ke desktop banner
- Banner ditampilkan sebagai slider jika ada multiple banners
- **Quality 80%** (lebih tinggi dari banner lain) karena header adalah elemen penting untuk branding

---

### 1.4. Perbandingan: PageHeader vs AdBannerSection

| Aspek | PageHeader | AdBannerSection |
|-------|------------|-----------------|
| **Lokasi** | Header halaman (atas) | Section konten (tengah/bawah) |
| **Slot Prefix** | `page_header_*` | `banner_main`, `sidebar_*` |
| **Ukuran** | 1920 × 1080 | 1920 × 640 (main), 900 × 400 (sidebar) |
| **Quality** | 80% | 75% (main), 70% (sidebar) |
| **Container Height** | `h-[60vh]` (60% viewport) | `min-h-[420px]` (main), `min-h-[200px]` (sidebar) |
| **Fungsi** | Background header dengan overlay teks | Banner promo/iklan dengan link |
| **Mobile Variant** | Ya (semua slot) | Ya (kecuali `homepage_slider`) |

**Kapan Menggunakan:**
- **PageHeader:** Untuk header halaman dengan teks overlay (judul, breadcrumb)
- **AdBannerSection:** Untuk banner promo/iklan di section konten

---

## 2. Event Images

### 2.1. Event Poster (Detail Page)
**Lokasi:** `pages/event/[slug].vue`

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Original** | 1920 × 1080 | 16:9 | WebP | 75% | Poster utama event (dari Spatie Media Library) |
| **Card Thumb** | 800 × 500 | 8:5 | WebP | 70% | Thumbnail untuk card listing |
| **Mobile Thumb** | 600 × 400 | 3:2 | WebP | 65% | Thumbnail untuk mobile |

**Catatan:**
- Backend (Laravel) otomatis generate 3 ukuran via Spatie Media Library
- Frontend akan memilih ukuran sesuai konteks (card vs detail)

---

### 2.2. Event Card (Listing)
**Lokasi:** `components/event/EventCard.vue`

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Desktop** | 640 × 420 | 32:21 | WebP | 70% | Thumbnail di card (width: 240px) |
| **Mobile** | 640 × 360 | 16:9 | WebP | 70% | Thumbnail di card (full width) |

**Dimensi Container:**
- Desktop: `w-[240px]` dengan `aspect-[4/5]` (portrait)
- Mobile: `w-full` dengan `aspect-[16/9]` (landscape)

**Catatan:**
- Event card menggunakan aspect ratio berbeda untuk desktop (portrait) dan mobile (landscape)
- Pastikan elemen penting tidak ter-crop di kedua format

---

### 2.3. Event Hero Card (Homepage)
**Lokasi:** `components/sections/HeroSection.vue` (card di slide event)

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Thumbnail** | 640 × 400 | 8:5 | WebP | 75% | Thumbnail di hero card |

**Dimensi Container:**
- Desktop: `w-[320px] xl:w-[360px]` dengan `h-40` (160px)
- Mobile: `w-32` (128px) dengan `h-full`

---

## 3. Blog Images

### 3.1. Blog Banner (Detail Page)
**Lokasi:** `pages/blog/[slug].vue`

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Banner** | 1920 × 1080 | 16:9 | WebP | 75% | Banner artikel blog |

**Catatan:**
- Blog menggunakan plugin `stephenjude/filament-blog`
- Banner disimpan sebagai `varchar` (bukan Spatie Media Library)
- **PENTING:** Optimasi manual sebelum upload (kompres ke WebP, max 500KB)

---

### 3.2. Blog Card (Listing)
**Lokasi:** `components/sections/BlogSection.vue`

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Thumbnail** | 800 × 500 | 8:5 | WebP | 70% | Thumbnail di card blog |

**Dimensi Container:**
- Desktop & Mobile: `aspect-[16/9]` (landscape)

---

## 4. Logo & Branding

### 4.1. Vendor Logo
**Lokasi:** Direktori vendor (`/ekosistem/vendor-*`)

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Original** | 800 × 800 | 1:1 | WebP | 75% | Logo vendor (square) |
| **Thumbnail** | 400 × 400 | 1:1 | WebP | 70% | Thumbnail untuk card |

**Catatan:**
- Logo vendor harus square (1:1)
- Transparan background (PNG) atau solid color (JPG)
- Max file size: 500KB sebelum upload

---

### 4.2. Running Community Logo
**Lokasi:** Direktori komunitas (`/ekosistem/komunitas-lari`)

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Original** | 800 × 800 | 1:1 | WebP | 75% | Logo komunitas (square) |
| **Thumbnail** | 400 × 400 | 1:1 | WebP | 70% | Thumbnail untuk card |

**Catatan:**
- Sama dengan vendor logo (square format)

---

### 4.3. Site Logo (Header/Footer)
**Lokasi:** `components/layout/` (header & footer)

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Header Logo** | 200 × 60 | 10:3 | PNG/SVG | - | Logo di header (transparan) |
| **Footer Logo** | 200 × 60 | 10:3 | PNG/SVG | - | Logo di footer (transparan) |
| **Favicon** | 32 × 32 | 1:1 | ICO/PNG | - | Favicon (16×16, 32×32, 180×180) |

**Catatan:**
- Header/Footer logo: PNG dengan transparan atau SVG
- Favicon: Multi-size (16×16, 32×32, 180×180 untuk Apple Touch Icon)

---

## 5. Social Media & OG Images

### 5.1. Open Graph (OG) Image
**Lokasi:** `nuxt.config.ts` (default: `/og.webp`)

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **OG Default** | 1200 × 630 | 1.91:1 | WebP | 80% | Default OG image untuk semua halaman |
| **OG Event** | 1200 × 630 | 1.91:1 | WebP | 80% | OG image spesifik event (dari poster) |

**Catatan:**
- OG image digunakan untuk preview di Facebook, Twitter, WhatsApp, dll.
- Aspect ratio 1.91:1 adalah standar Open Graph
- Pastikan teks penting berada di center-safe area (tidak ter-crop di berbagai platform)

---

### 5.2. Twitter Card Image
**Lokasi:** Sama dengan OG Image

| Ukuran | Dimensi (px) | Aspect Ratio | Format | Quality | Keterangan |
|--------|---------------|--------------|--------|---------|------------|
| **Summary Card** | 1200 × 630 | 1.91:1 | WebP | 80% | Sama dengan OG image |
| **Large Image** | 1200 × 1200 | 1:1 | WebP | 80% | Opsional (jika menggunakan large card) |

---

## 6. Best Practices

### 6.1. Format File

**Rekomendasi:**
- **Upload:** JPG atau PNG (original)
- **Output:** WebP (otomatis oleh Spatie Media Library & Nuxt Image)
- **Kualitas:** 70-75% untuk WebP (sweet spot antara kualitas dan ukuran)

**Hindari:**
- ❌ Format HEIC/HEIF (tidak didukung browser)
- ❌ File terlalu besar (>5MB sebelum upload)
- ❌ Gambar dengan metadata berlebihan (strip EXIF jika perlu)

---

### 6.2. Optimasi Sebelum Upload

**Checklist:**
1. ✅ Resize ke ukuran maksimal yang diperlukan (lihat tabel di atas)
2. ✅ Kompres dengan tool seperti TinyPNG, Squoosh, atau ImageOptim
3. ✅ Strip metadata (EXIF) untuk mengurangi file size
4. ✅ Pastikan aspect ratio sesuai (jangan force stretch)

**Tools Rekomendasi:**
- **Online:** [Squoosh.app](https://squoosh.app), [TinyPNG](https://tinypng.com)
- **Desktop:** ImageOptim (Mac), FileOptimizer (Windows)
- **CLI:** `sharp-cli`, `imagemin`

---

### 6.3. Safe Area (Text Overlay)

**Untuk Banner dengan Teks:**
- **Center Safe Area:** 80% tengah gambar (hindari 10% pinggir kiri/kanan)
- **Vertical Safe Area:** 70% tengah gambar (hindari 15% atas/bawah)

**Contoh:**
```
┌─────────────────────────┐
│  ⚠️ HINDARI AREA INI    │ ← 15% atas
│                         │
│  ✅ SAFE AREA (70%)     │
│     Teks penting        │
│     di sini             │
│                         │
│  ⚠️ HINDARI AREA INI    │ ← 15% bawah
└─────────────────────────┘
```

---

### 6.4. Responsive Images

**Sistem Otomatis:**
- **Backend (Laravel):** Spatie Media Library generate multiple sizes dan format WebP
- **Frontend (Nuxt):** `@nuxt/image` otomatis serve ukuran sesuai device dan viewport

**Alur Kerja:**
1. **Upload:** Admin upload 1 file original (JPG/PNG) via Filament
2. **Backend Processing:** Spatie Media Library otomatis:
   - Generate WebP conversion (quality 70-80%)
   - Generate multiple sizes (webp, mobile, thumb, dll)
   - Store di `storage/app/public/media/`
3. **Frontend Rendering:** Nuxt Image (`useImage()`) otomatis:
   - Pilih ukuran terbaik sesuai viewport
   - Serve WebP format (fallback ke original jika perlu)
   - Lazy loading untuk gambar di bawah fold

**Yang Perlu Anda Lakukan:**
- ✅ Upload 1 file original (ukuran terbesar, max 5MB)
- ✅ Sistem akan otomatis generate ukuran lain
- ✅ Browser akan memilih ukuran terbaik sesuai viewport

**Catatan Teknis:**
- Backend generate size berdasarkan `registerMediaConversions()` di Model
- Frontend request size via `$img(src, { width, height, quality })`
- Jika frontend request size yang belum di-generate, backend akan generate on-the-fly

---

### 6.5. File Size Guidelines

| Tipe Gambar | Max Size (Original) | Target Size (WebP) |
|-------------|---------------------|-------------------|
| Hero/Banner | 2MB | < 300KB |
| Event Poster | 3MB | < 400KB |
| Event Card | 1MB | < 150KB |
| Logo | 500KB | < 100KB |
| Blog Banner | 2MB | < 300KB |
| OG Image | 1MB | < 200KB |

**Catatan:**
- Target size adalah setelah konversi ke WebP
- Gunakan Lighthouse untuk audit: target < 200KB untuk LCP (Largest Contentful Paint)

---

### 6.6. Naming Convention

**Format:**
```
[nama-deskriptif]-[ukuran]-[variant].webp
```

**Contoh:**
- `hero-banner-1920x1080.webp`
- `event-poster-800x500-thumb.webp`
- `vendor-logo-400x400.webp`

**Catatan:**
- Naming convention ini opsional (Spatie Media Library akan auto-generate)
- Gunakan untuk file manual (seperti OG image, favicon)

---

## 7. Quick Reference Table

### Ukuran Paling Sering Digunakan

| Elemen | Desktop | Mobile | Aspect Ratio |
|--------|---------|--------|--------------|
| **Hero Slider** | 1920 × 1080 | 1920 × 1080 | 16:9 |
| **Banner Main** | 1920 × 640 | 1200 × 720 | 3:1 / 5:3 |
| **Banner Sidebar** | 900 × 400 | 1200 × 720 | 9:4 / 5:3 |
| **Event Poster** | 1920 × 1080 | 1920 × 1080 | 16:9 |
| **Event Card** | 640 × 420 | 640 × 360 | 32:21 / 16:9 |
| **Blog Banner** | 1920 × 1080 | 1920 × 1080 | 16:9 |
| **Logo** | 800 × 800 | 400 × 400 | 1:1 |
| **OG Image** | 1200 × 630 | 1200 × 630 | 1.91:1 |

---

## 8. Troubleshooting

### Gambar Terlihat Blur
**Penyebab:**
- Quality terlalu rendah (< 70%)
- Ukuran original terlalu kecil (di-stretch)

**Solusi:**
- Upload original minimal 2x ukuran target (contoh: untuk 1920px, upload 3840px)
- Set quality 75% untuk WebP

---

### Gambar Terlalu Besar (Slow Loading)
**Penyebab:**
- File original terlalu besar (> 5MB)
- Tidak di-optimize sebelum upload

**Solusi:**
- Kompres dengan Squoosh atau TinyPNG
- Strip metadata (EXIF)
- Pastikan sistem otomatis generate WebP (cek di backend)

---

### Aspect Ratio Tidak Cocok
**Penyebab:**
- Upload gambar dengan aspect ratio berbeda dari yang diperlukan

**Solusi:**
- Crop ke aspect ratio yang benar sebelum upload
- Atau gunakan `object-cover` (akan crop otomatis, pastikan elemen penting di center)

---

## 9. Tools & Resources

### Online Tools
- **[Squoosh.app](https://squoosh.app)** - Kompres & convert ke WebP
- **[TinyPNG](https://tinypng.com)** - Kompres PNG/JPG
- **[Canva](https://canva.com)** - Desain banner dengan template ukuran preset
- **[Figma](https://figma.com)** - Desain dengan frame size yang tepat

### Browser Extensions
- **WebP Converter** - Convert gambar ke WebP di browser
- **ImageOptim** - Batch optimize images

### Design Templates
- **Hero Banner:** 1920×1080px frame di Figma/Canva
- **Event Card:** 640×420px frame (desktop), 640×360px (mobile)
- **OG Image:** 1200×630px frame dengan safe area guide

---

## 📝 Catatan Penting

1. **Spatie Media Library** di backend akan otomatis generate WebP dan multiple sizes
2. **Nuxt Image** di frontend akan otomatis serve ukuran terbaik sesuai device
3. **Upload original terbesar**, sistem akan handle resize otomatis
4. **Pastikan aspect ratio benar** untuk menghindari crop yang tidak diinginkan
5. **Test di berbagai device** (mobile, tablet, desktop) sebelum publish

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0  
**Maintained by:** Development Team

