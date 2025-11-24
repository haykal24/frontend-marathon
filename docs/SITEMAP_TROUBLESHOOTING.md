# Sitemap Troubleshooting Guide

## Overview

Sitemap di aplikasi ini menggunakan `@nuxtjs/sitemap` yang fetch URLs dari backend `SitemapController`. Multiple sitemaps dibuat otomatis jika URLs > 50k.

## Struktur Sitemap

```
http://localhost:3000/sitemap_index.xml          # Index (aggregates semua sitemaps)
├── http://localhost:3000/__sitemap__/0.xml      # Static pages + categories
├── http://localhost:3000/__sitemap__/1.xml      # Events detail
├── http://localhost:3000/__sitemap__/2.xml      # Blog posts
└── ...
```

## Backend URLs (dari SitemapController)

SitemapController generate array URLs dengan struktur:

```json
[
  {
    "loc": "http://localhost:3000/",
    "changefreq": "daily",
    "priority": 1.0,
    "lastmod": "2025-11-17T10:55:52Z"
  },
  {
    "loc": "http://localhost:3000/event",
    "changefreq": "hourly",
    "priority": 0.9
  },
  {
    "loc": "http://localhost:3000/event/borobudur-marathon-2025",
    "changefreq": "daily",
    "priority": 0.8,
    "lastmod": "2025-11-16T15:30:00Z"
  },
  // ... lebih banyak URLs
]
```

## Problem: Sitemap hanya menampilkan index (tidak ada detail URLs)

### Penyebab

1. **Backend API tidak accessible/timeout** → fetch gagal → urls array kosong
2. **CORS issues** → frontend tidak bisa call backend (jarang untuk SSR karena server-side)
3. **API endpoint return error** → `/api/v1/sitemap` tidak ditemukan atau error

### Solusi

#### 1. Periksa backend SitemapController
```bash
# Test endpoint
curl http://localhost:8000/api/v1/sitemap

# Atau dengan artisan
php artisan tinker
>>> response(new \App\Http\Controllers\Api\SitemapController())->getData()
```

Expected output: array of URLs dengan struktur loc, changefreq, priority, lastmod

#### 2. Periksa nuxt.config.ts sitemap config

```typescript
sitemap: {
  sources: [
    process.env.NUXT_SITEMAP_API_URL || 
    `${process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1'}/sitemap`,
  ],
  
  urls: async () => {
    try {
      const apiUrl = process.env.NUXT_SITEMAP_API_URL || 
        `${process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1'}/sitemap`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.warn(`Sitemap API returned ${response.status}`);
        return [];
      }
      
      const urls = await response.json();
      return Array.isArray(urls) ? urls : [];
    } catch (error) {
      console.warn('Error fetching sitemap URLs:', error);
      return [];
    }
  },
}
```

#### 3. Build dan check sitemap

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview

# Check sitemap
curl http://localhost:3000/sitemap_index.xml
curl http://localhost:3000/__sitemap__/0.xml
```

### Mengontrol Facet / Filter URLs

Query-string URLs seperti `/event?category=5k` atau `/faq?keyword=pace` sering dianggap "orphan pages" oleh Google karena hanya muncul lewat filter interaktif. Untuk mencegah hal ini, backend sekarang menonaktifkan facet URLs secara default. Jika suatu saat sudah tersedia landing page khusus yang bisa dijelajahi crawler, aktifkan kembali lewat environment variable backend:

```
SITEMAP_INCLUDE_FACET_URLS=true
```

Langkah setelah mengubahnya:

1. Jalankan `php artisan cache:forget sitemap_urls` (atau `php artisan optimize:clear`) agar cache sitemap diperbarui.
2. Tambahkan kembali entri `categories` di `nuxt.config.ts` (`sitemap.sitemaps` dan daftar `robots.sitemap`) sehingga `/__sitemap__/categories.xml` tersedia lagi.

Biarkan nilai default `false` jika facet URLs masih berupa hasil filter AJAX tanpa tautan internal permanen.

## Problem: SSR build gagal karena fetch sitemap timeout

### Penyebab

- Backend tidak running saat build
- Network unreachable dari build server (cloud environment)
- Timeout terlalu short

### Solusi

#### 1. Pastikan backend running

```bash
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend build
cd frontend
npm run build
```

#### 2. Gunakan NUXT_SITEMAP_API_URL untuk production

Jika frontend dan backend di cloud server yang sama:

```bash
# .env production
NUXT_PUBLIC_SITE_URL=https://indonesiamarathon.com
NUXT_PUBLIC_API_BASE=https://indonesiamarathon.com/api/v1

# Internal URL untuk sitemap (server-side only, tidak exposed ke public)
NUXT_SITEMAP_API_URL=http://localhost:8000/api/v1/sitemap
```

#### 3. Add timeout handling

```typescript
// Dalam nuxt.config.ts urls()
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

try {
  const response = await fetch(apiUrl, { signal: controller.signal });
  // ...
} catch (error) {
  if (error.name === 'AbortError') {
    console.warn('Sitemap fetch timeout');
  }
  return [];
} finally {
  clearTimeout(timeoutId);
}
```

## Problem: Event/Blog detail URLs tidak ada di sitemap

### Penyebab

1. **Status event/blog tidak "published"** → query filter gagal
2. **EventCategory tanpa `is_active`** → field tidak ditemukan di migration
3. **Relationship tidak defined** → `whereHas('events')` gagal

### Solusi

#### 1. Periksa event status

```bash
# Artisan tinker
php artisan tinker
>>> App\Models\Event::where('status', 'published')->count()
>>> App\Models\Event::where('status', 'draft')->count()
```

#### 2. Periksa EventCategory migration

EventCategory **tidak punya** field `is_active`. Update SitemapController untuk remove check:

```php
// ❌ WRONG
EventCategory::query()
  ->where('is_active', true)
  ->each(...)

// ✅ CORRECT
EventCategory::query()
  ->whereHas('events', function ($query) {
    $query->where('status', 'published');
  })
  ->each(...)
```

#### 3. Periksa query results

```bash
php artisan tinker

# Events published
>>> App\Models\Event::where('status', 'published')->count()

# Blog posts published
>>> Stephenjude\FilamentBlog\Models\Post::whereNotNull('published_at')->where('published_at', '<=', now())->count()

# EventCategories dengan events
>>> App\Models\EventCategory::whereHas('events', function ($q) { $q->where('status', 'published'); })->count()
```

## Problem: Multiple sitemaps tidak split

### Penyebab

- URLs < 50k (baru membutuhkan 1 sitemap)
- Config `sitemaps` tidak format dengan benar

### Solusi

```typescript
// ✅ CORRECT - Multiple sitemaps dengan split
sitemap: {
  sitemaps: {
    splitSize: 50000,  // Split jika > 50k entries
  }
}

// Output: 
// - sitemap_index.xml
// - __sitemap__/0.xml (URLs 1-50k)
// - __sitemap__/1.xml (URLs 50k-100k)
```

## Testing Sitemap

### 1. Periksa struktur XML

```bash
# Periksa format XML valid
curl http://localhost:3000/sitemap_index.xml | xmllint --format -

# Periksa jumlah URLs per sitemap
curl http://localhost:3000/__sitemap__/0.xml | grep -c "<url>"
```

### 2. Validasi dengan Google Search Console

1. Upload `/sitemap_index.xml` ke Google Search Console
2. Periksa report: jumlah URLs, status index, errors

### 3. Monitor cache

```bash
# Redis cache key untuk sitemap
KEYS *sitemap*

# Clear cache jika perlu refresh
FLUSHDB
```

## Performance Tips

1. **Cache aggressively** (6 hours default)
   ```php
   Cache::remember('sitemap_urls', now()->addHours(6), function () {
     // Generate URLs
   });
   ```

2. **Limit queries** (events default 1000 untuk performance)
   ```php
   Event::query()
     ->limit(1000)  // Limit untuk query performance
     ->each(...)
   ```

3. **Select minimal columns**
   ```php
   Event::query()
     ->select(['slug', 'updated_at', 'status'])  // Hanya columns yang dibutuhkan
     ->each(...)
   ```

4. **Index database**
   ```sql
   -- Pastikan ada index untuk query performance
   ALTER TABLE events ADD INDEX idx_status (status);
   ALTER TABLE blog_posts ADD INDEX idx_published_at (published_at);
   ```

## Monitoring

### Logs untuk troubleshooting

```bash
# Laravel (backend)
tail -f storage/logs/laravel.log

# Nuxt (frontend)
# Check console saat build/run
# Error akan terlihat di output build
```

### Metrics

```bash
# Jumlah URLs di sitemap
SELECT COUNT(*) FROM events WHERE status = 'published';
SELECT COUNT(*) FROM blog_posts WHERE published_at <= NOW();
SELECT COUNT(*) FROM event_categories;

# Cache status
redis-cli
> KEYS sitemap*
> TTL sitemap_urls
```

## Checklist

- [ ] Backend `/api/v1/sitemap` return 200 OK
- [ ] Event/Blog URLs di sitemap dengan status "published"
- [ ] EventCategory URLs di sitemap (tanpa `is_active` check)
- [ ] Province URLs di sitemap (dengan `is_active` check)
- [ ] Multiple sitemaps split > 50k URLs
- [ ] Google Search Console menunjukkan semua URLs
- [ ] SSR build berhasil (tidak timeout)
- [ ] Cache 6 hours working (header Cache-Control)

