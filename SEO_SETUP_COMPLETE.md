# SEO Setup Complete - IndonesiaMarathon.com

Dokumentasi lengkap konfigurasi SEO yang telah diimplementasikan di frontend Marathon Indonesia.

---

## 📋 Checklist SEO Implementation

### ✅ Global Head Configuration (app.vue)

Semua konfigurasi meta tags terpusat di `frontend/app.vue` untuk kemudahan maintenance.

#### 1. **Title Template**

```
"{{ pageTitle }} | IndonesiaMarathon.com"
```

- Diaplikasikan ke semua halaman secara otomatis
- Default: "IndonesiaMarathon.com - Kalender Lari & Jadwal Marathon 2025 Terlengkap di Indonesia"

#### 2. **Meta Tags - Teknis Dasar**

- ✅ Charset: UTF-8
- ✅ Viewport: width=device-width, initial-scale=1, viewport-fit=cover
- ✅ Referrer: no-referrer-when-downgrade
- ✅ Format Detection: telephone=no
- ✅ Description (default): Platform digital #1 event lari Indonesia...

#### 3. **Meta Tags - PWA & Mobile**

- ✅ mobile-web-app-capable: yes
- ✅ apple-mobile-web-app-capable: yes
- ✅ apple-mobile-web-app-status-bar-style: black-translucent
- ✅ apple-mobile-web-app-title: IndoMarathon

#### 4. **Meta Tags - Theme & Colors**

- ✅ theme-color: #121212 (Primary)
- ✅ msapplication-TileColor: #121212
- ✅ color-scheme: dark light

#### 5. **Open Graph (OG) Tags** - Social Media Sharing

- ✅ og:type: website
- ✅ og:site_name: IndonesiaMarathon.com
- ✅ og:title: [Dynamic]
- ✅ og:description: [Dynamic]
- ✅ og:image: /og.webp (1200x630px, WebP format)
- ✅ og:image:width: 1200
- ✅ og:image:height: 630
- ✅ og:image:type: image/webp
- ✅ og:locale: id_ID

#### 6. **Twitter Card Tags** - Twitter Sharing

- ✅ twitter:card: summary_large_image
- ✅ twitter:title: [Dynamic]
- ✅ twitter:description: [Dynamic]
- ✅ twitter:image: /og.webp
- ✅ twitter:image:alt: IndonesiaMarathon.com

#### 7. **Additional SEO Meta Tags**

- ✅ keywords: kalender lari, jadwal marathon, event running, fun run, trail run, Indonesia
- ✅ author: IndonesiaMarathon.com
- ✅ copyright: © 2025 IndonesiaMarathon.com. All rights reserved.

#### 8. **Canonical URL**

- ✅ Dynamic canonical URL berdasarkan current route
- ✅ Format: `https://indonesiamarathon.com{path}`

#### 9. **Link Tags - Favicons & PWA**

- ✅ favicon.ico (32x32, 16x16)
- ✅ apple-touch-icon.png (180x180)
- ✅ android-chrome-192x192.png
- ✅ android-chrome-512x512.png
- ✅ site.webmanifest (PWA manifest)

#### 10. **Link Tags - Preconnect**

- ✅ Preconnect ke API Backend (untuk performa)
- ✅ DNS-prefetch ke API Backend

#### 11. **Link Tags - Alternate hreflang**

- ✅ hreflang="id" untuk Indonesian locale (future-ready for multi-language)

---

## 🔧 Nuxt Configuration (nuxt.config.ts)

### SEO Module Configuration

```typescript
site: {
  url: 'https://indonesiamarathon.com',
  name: 'IndonesiaMarathon.com',
  description: 'Platform digital #1 di Indonesia...',
  defaultLocale: 'id',
  trailingSlash: false,
  indexable: true,
}
```

### OpenGraph & Twitter

- OG Image enabled dengan preset 1200x630px
- Schema.org identity: Organization

### Robots Configuration

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
```

### Sitemap

- ✅ Dihasilkan dari API endpoint: `/api/__sitemap__/urls`
- ✅ Format: XML
- ✅ XSL: Disabled (clean format)

### Image Optimization

- ✅ Provider: IPX (built-in Nuxt)
- ✅ Quality: 80
- ✅ Format: WebP
- ✅ Responsive breakpoints: xs, sm, md, lg, xl, xxl
- ✅ Densities: 1x, 2x (Retina)
- ✅ Presets: avatar, cover

---

## 📁 Public Assets

### Favicon & Icons

Lokasi: `frontend/public/`

- ✅ `favicon.ico` - Favicon utama
- ✅ `favicon-16x16.png` - Favicon kecil
- ✅ `favicon-32x32.png` - Favicon medium
- ✅ `apple-touch-icon.png` - iOS app icon (180x180)
- ✅ `android-chrome-192x192.png` - Android home screen (192x192)
- ✅ `android-chrome-512x512.png` - Android splash screen (512x512)

### OG Image

- ✅ `og.webp` - Open Graph image (1200x630px, WebP format)
- **Note:** Update ini sesuai branding/konten

### PWA & SEO

- ✅ `site.webmanifest` - PWA manifest dengan:
  - App name: "IndonesiaMarathon - Kalender Lari & Jadwal Marathon 2025"
  - Short name: "IndoMarathon"
  - Theme color: #121212 (Primary)
  - Background: #F7F9F0 (Surface)
  - App shortcuts untuk Jadwal Lari dan Blog
  - Screenshots untuk PWA install

- ✅ `robots.txt` - Search engine crawler instructions dengan:
  - Allow: / (semua halaman dapat diindex)
  - Disallow: /api/, /admin/ (tidak diindex)
  - Sitemap location
  - Crawl delay dan request rate
  - Khusus untuk bad bots (Ahrefs, Semrush)

---

## 🔄 Dynamic Content

### Copywriting dengan Dynamic Year

Semua section menggunakan `useCurrentYear()` composable:

**Section yang sudah diupdate:**

- ✅ Hero Section: "Kalender Lari & Jadwal Marathon {{ currentYear }}"
- ✅ Event Type Section: "Kategori running event {{ currentYear }}"
- ✅ Event Latest Section: "Event running {{ currentYear }} terbaru"
- ✅ Blog Section: "Upgrade pengetahuan untuk tahun {{ currentYear }}"
- ✅ Calendar Section: "Kalender Event Lari {{ currentYear }}"
- ✅ Province Section: "Event favorit {{ currentYear }}"

---

## 📊 SEO Best Practices Diterapkan

### ✅ Technical SEO

- [x] Canonical URLs
- [x] Proper meta descriptions
- [x] Title templates
- [x] Mobile optimization (viewport, PWA)
- [x] Page speed optimization (image presets, WebP format)
- [x] Structured data (Schema.org)
- [x] Sitemap XML
- [x] Robots.txt
- [x] PWA manifest

### ✅ On-Page SEO

- [x] Semantic HTML (h1, h2, p tags)
- [x] Proper heading hierarchy
- [x] Image alt texts (via NuxtImg)
- [x] Internal linking structure
- [x] Dynamic meta tags per page
- [x] Copywriting dengan keyword targeting

### ✅ Off-Page SEO

- [x] Open Graph tags (Facebook sharing)
- [x] Twitter Card tags (Twitter sharing)
- [x] Schema.org markup (Google Rich Results)
- [x] Preconnect links (performance)

### ✅ Performance SEO

- [x] WebP image format
- [x] Image responsive breakpoints
- [x] Lazy loading (via NuxtImg)
- [x] Font optimization (@nuxtjs/fontaine)
- [x] Third-party script optimization (@nuxtjs/partytown)
- [x] Route-based caching (SWR, SSR)

---

## 🚀 Ready for Production

Konfigurasi SEO sudah **100% complete** dan ready untuk production deployment dengan:

- ✅ Global SEO head terpusat di `app.vue`
- ✅ OG & Twitter cards lengkap
- ✅ Canonical URL dynamic
- ✅ PWA support penuh
- ✅ Image optimization optimal
- ✅ Dynamic year di copywriting
- ✅ Robots.txt & sitemap
- ✅ All favicons & assets

### Deployment Checklist

Sebelum production, pastikan:

1. [ ] Update `NUXT_PUBLIC_SITE_URL` ke domain production (contoh: `https://indonesiamarathon.com`)
2. [ ] Update `NUXT_PUBLIC_API_BASE` ke API endpoint production
3. [ ] Verifikasi `og.webp` sudah diupload di public folder
4. [ ] Pastikan favicon dan icons ada di public folder
5. [ ] Test SEO dengan:
   - Google Search Console
   - Facebook Sharing Debugger
   - Twitter Card Validator
   - Schema.org validator

---

## 📝 Files Modified

1. **frontend/app.vue** - Konfigurasi head lengkap dengan OG, Twitter, canonical
2. **frontend/nuxt.config.ts** - Optimasi konfigurasi, pindah head ke app.vue
3. **frontend/public/robots.txt** - Crawler instructions lengkap
4. **frontend/public/site.webmanifest** - PWA manifest dengan app details
5. **frontend/composables/useCurrentYear.ts** - Dynamic year helper
6. **frontend/components/sections/** - Semua section dengan dynamic year copywriting

---

**Last Updated:** 2025-11-12  
**Status:** ✅ Complete & Production Ready
