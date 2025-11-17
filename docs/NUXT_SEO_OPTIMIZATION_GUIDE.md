# Panduan Optimasi Nuxt SEO Module

Dokumentasi lengkap untuk implementasi dan optimasi modul `@nuxtjs/seo` di semua halaman website.

## 📋 Table of Contents

1. [Konfigurasi Global](#konfigurasi-global)
2. [Open Graph (OG) Image Strategy](#open-graph-og-image-strategy)
3. [Optimasi Per Halaman](#optimasi-per-halaman)
4. [Best Practices](#best-practices)
5. [Testing & Validation](#testing--validation)

---

## 🌍 Konfigurasi Global

### File: `nuxt.config.ts`

Konfigurasi global yang sudah diterapkan:

```typescript
// Site Meta Configuration (Centralized for @nuxtjs/seo)
site: {
  url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  name: 'indonesiamarathon.com',
  description: `Platform digital #1 di Indonesia sebagai pusat informasi dan komunitas event lari. Temukan jadwal lari ${new Date().getFullYear()} terlengkap, ekosistem vendor, dan artikel seputar dunia lari.`,
  defaultLocale: 'id-ID',
},

seo: {
  breadcrumbs: true, // Otomatis generate breadcrumb schema
  linkChecker: {
    enabled: true,
    failOnError: false,
  },
},

// OG Image Configuration (Fallback untuk semua halaman)
ogImage: {
  enabled: true,
  defaults: {
    url: '/og.webp', // Fallback image di public folder
    width: 1200,
    height: 630,
    alt: 'indonesiamarathon.com - Platform Digital #1 Event Lari Indonesia',
  },
},
```

### File: `app.vue`

Organization Schema untuk Google Sitelinks:

```typescript
useSchemaOrg([
  defineOrganization({
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [
      'https://www.instagram.com/indonesiamarathon',
      'https://www.tiktok.com/@indonesiamarathon',
    ],
    potentialAction: [...], // Search box untuk Google
    mainEntity: [...], // Sitelink candidates
  }),
])
```

---

## 🖼️ Open Graph (OG) Image Strategy

### Hierarchy Strategi:

```
1. Gambar Spesifik Halaman (jika ada)
   ↓ (fallback jika tidak ada)
2. og.webp (default di public folder)
```

### File Default: `public/og.webp`

- **Ukuran:** 1200x630px (rasio 1.91:1)
- **Format:** WebP (optimal untuk performa)
- **Fungsi:** Digunakan otomatis untuk semua halaman yang tidak memiliki gambar spesifik

### Cara Mengganti Gambar Default:

1. Buat/edit gambar dengan ukuran **1200x630px**
2. Export sebagai **WebP** (atau PNG/JPG, akan di-convert)
3. Simpan ke `frontend/public/og.webp`
4. **Done!** Semua halaman otomatis menggunakan gambar baru

---

## 📄 Optimasi Per Halaman

### 1. Homepage (`pages/index.vue`)

**Status:** ✅ Sudah Optimal

**Implementasi:**

```vue
<script setup>
// SEO Meta
useSeoMetaDynamic({
  title: `Kalender Lari ${currentYear.value} & Jadwal Marathon Indonesia`,
  description: `Jelajahi jadwal lari ${currentYear.value} terlengkap...`,
  url: '/',
})

// OG Image: Otomatis menggunakan og.webp (tidak perlu defineOgImage)
</script>
```

**Notes:**
- Tidak perlu `defineOgImage` karena homepage menggunakan default `og.webp`
- Title dan description dinamis (tahun otomatis update)

---

### 2. Halaman Detail Event (`pages/event/[slug].vue`)

**Status:** ✅ Sudah Optimal

**Implementasi:**

```vue
<script setup>
// SEO Meta
useSeoMetaDynamic({
  title: evt.seo_title || evt.title,
  description: evt.seo_description || evt.description?.substring(0, 160),
  url: `/event/${slug}`,
  type: 'article',
  publishedTime: evt.created_at,
})

// OG Image: Gunakan poster event
if (evt.poster_webp_url || evt.image) {
  defineOgImage({
    url: evt.poster_webp_url || evt.image,
    alt: `${evt.title} - ${evt.location_name}`,
    width: 1200,
    height: 630,
  })
}
// Fallback ke og.webp jika tidak ada poster

// Event Schema
useSchemaOrg([
  defineEvent({
    name: evt.title,
    startDate: evt.event_date,
    endDate: evt.event_end_date,
    location: { ... },
    offers: [ ... ], // Info harga & tiket
  }),
])
</script>
```

**Notes:**
- **OG Image Priority:** Poster Event → og.webp
- **Schema.org:** Wajib untuk SEO event (rich results di Google)
- **Offers:** Menampilkan info harga di search results

---

### 3. Halaman Detail Blog (`pages/blog/[slug].vue`)

**Status:** ✅ Sudah Optimal

**Implementasi:**

```vue
<script setup>
// SEO Meta
useSeoMetaDynamic({
  title: seoTitle.value,
  description: seoDescription.value,
  type: 'article',
  url: `/blog/${post.value?.slug}`,
})

// OG Image: Gunakan banner artikel
if (post.value?.banner) {
  defineOgImage({
    url: post.value.banner,
    alt: `${post.value.title} - ${post.value.category?.name}`,
    width: 1200,
    height: 630,
  })
}
// Fallback ke og.webp jika tidak ada banner

// Article Schema
useSchemaOrg([
  defineArticle({
    headline: post.value?.title,
    description: seoDescription.value,
    datePublished: post.value?.published_at,
    author: { ... },
    image: post.value?.banner,
  }),
])
</script>
```

**Notes:**
- **OG Image Priority:** Banner Artikel → og.webp
- **Schema.org:** Wajib untuk SEO artikel (rich results di Google)

---

### 4. Template Halaman Lainnya

Untuk halaman baru, ikuti pattern ini:

```vue
<script setup>
// 1. SEO Meta (WAJIB)
useSeoMetaDynamic({
  title: 'Judul Halaman',
  description: 'Deskripsi singkat (max 160 karakter)',
  url: '/url-halaman',
  type: 'website', // atau 'article' untuk konten
})

// 2. OG Image (OPSIONAL - jika ada gambar spesifik)
if (hasSpecificImage) {
  defineOgImage({
    url: imageUrl,
    alt: 'Deskripsi gambar',
    width: 1200,
    height: 630,
  })
}
// Jika tidak ada, otomatis menggunakan og.webp

// 3. Schema.org (OPSIONAL - sesuai tipe konten)
useSchemaOrg([
  defineWebPage({
    name: 'Nama Halaman',
    description: 'Deskripsi',
    url: fullUrl,
  }),
])
</script>
```

---

## ✅ Best Practices

### DO's ✅

1. **Selalu gunakan `useSeoMetaDynamic`** untuk setiap halaman
2. **Gunakan `defineOgImage`** hanya jika ada gambar spesifik yang lebih relevan dari default
3. **Pastikan gambar OG berukuran 1200x630px** (rasio 1.91:1)
4. **Gunakan Schema.org** sesuai tipe konten:
   - `defineEvent` untuk event
   - `defineArticle` untuk artikel/blog
   - `defineWebPage` untuk halaman umum
5. **Test di Facebook Debugger & Twitter Card Validator** setelah deploy

### DON'Ts ❌

1. **Jangan hardcode** URL lengkap di `useSeoMetaDynamic` (gunakan path relatif)
2. **Jangan lupa** `alt` text di `defineOgImage`
3. **Jangan duplikasi** meta tags di `useHead` dan `useSeoMetaDynamic` (gunakan salah satu)
4. **Jangan skip** Schema.org di halaman event/blog (penting untuk rich results)

---

## 🧪 Testing & Validation

### Tools untuk Testing:

1. **Facebook Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Test: Open Graph tags & preview

2. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Test: Twitter card preview

3. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Test: Schema.org markup

4. **Nuxt DevTools**
   - Buka: http://localhost:3000/__nuxt_devtools__
   - Tab: "SEO" untuk inspect meta tags & schema

### Checklist Testing:

- [ ] Homepage menampilkan og.webp di social share
- [ ] Event detail menampilkan poster event di social share
- [ ] Blog detail menampilkan banner artikel di social share
- [ ] Semua halaman memiliki title & description unik
- [ ] Schema.org valid di Google Rich Results Test
- [ ] Breadcrumbs muncul di Google Search Console
- [ ] Sitemap ter-generate otomatis dari backend API

---

## 📊 Monitoring

### Google Search Console

- **URL:** https://search.google.com/search-console
- **Monitor:**
  - Coverage (halaman ter-index)
  - Enhancements (rich results)
  - Core Web Vitals

### Backend Sitemap

- **Endpoint:** `${API_BASE}/sitemap`
- **Auto-update:** Ya (dari SitemapController)
- **Include:**
  - All published events
  - All published blog posts
  - Static pages
  - Filter pages

---

## 🔄 Changelog

### v1.0.0 (Current)

- ✅ Konfigurasi global `site` config
- ✅ OG Image fallback (`og.webp`)
- ✅ Homepage SEO optimized
- ✅ Event detail SEO optimized (with Schema.org)
- ✅ Blog detail SEO optimized (with Schema.org)
- ✅ Breadcrumbs auto-generation
- ✅ Link checker enabled
- ✅ Organization Schema untuk Sitelinks

---

## 📞 Support

Jika ada pertanyaan atau issue terkait SEO, hubungi:

- **Developer:** [Your Name]
- **Documentation:** `/docs/NUXT_SEO_OPTIMIZATION_GUIDE.md`
- **Nuxt SEO Docs:** https://nuxtseo.com

---

**Last Updated:** ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}

