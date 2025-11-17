# SEO Deployment & Production Guide

Panduan untuk deploy website dengan optimasi SEO maksimal di production.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Pastikan environment variables berikut ter-set di production:

```bash
# Frontend (.env atau environment config)
NUXT_PUBLIC_SITE_URL=https://indonesiamarathon.com
NUXT_PUBLIC_APP_NAME=indonesiamarathon.com
NUXT_PUBLIC_API_BASE=https://indonesiamarathon.com/api/v1

# CRITICAL: Sitemap API URL (internal network untuk performa)
NUXT_SITEMAP_API_URL=http://localhost:8000/api/v1/sitemap
# Atau jika Docker/K8s: http://backend-service:8000/api/v1/sitemap
```

```bash
# Backend (.env)
APP_URL=https://indonesiamarathon.com
APP_ENV=production
```

### 2. OG Image Default

✅ Upload file `og.webp` ke `frontend/public/`
- **Ukuran:** 1200x630px
- **Format:** WebP (optimal)
- **Konten:** Logo + Tagline website

### 3. Favicons & PWA Icons

✅ Pastikan semua favicon assets ada di `frontend/public/`:
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `site.webmanifest`

---

## 🚀 Deployment Scenarios

### Scenario 1: Single Server (Frontend + Backend Same Machine)

**Setup:**
- Nginx reverse proxy
- Laravel di port 8000 (internal)
- Nuxt di port 3000 (internal)
- Nginx expose port 80/443

**Environment Variables:**
```bash
# Frontend
NUXT_PUBLIC_SITE_URL=https://indonesiamarathon.com
NUXT_SITEMAP_API_URL=http://localhost:8000/api/v1/sitemap

# Backend
APP_URL=https://indonesiamarathon.com
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name indonesiamarathon.com;

    # Frontend (Nuxt SSR)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### Scenario 2: Docker Compose

**Environment Variables:**
```yaml
# docker-compose.yml
services:
  frontend:
    environment:
      - NUXT_PUBLIC_SITE_URL=https://indonesiamarathon.com
      - NUXT_SITEMAP_API_URL=http://backend:8000/api/v1/sitemap
      - NUXT_PUBLIC_API_BASE=https://indonesiamarathon.com/api/v1
  
  backend:
    environment:
      - APP_URL=https://indonesiamarathon.com
```

---

### Scenario 3: Separate Servers (Microservices)

**Setup:**
- Frontend: `app.indonesiamarathon.com` (Nuxt)
- Backend: `api.indonesiamarathon.com` (Laravel)

**Environment Variables:**
```bash
# Frontend
NUXT_PUBLIC_SITE_URL=https://app.indonesiamarathon.com
NUXT_SITEMAP_API_URL=https://api.indonesiamarathon.com/api/v1/sitemap
NUXT_PUBLIC_API_BASE=https://api.indonesiamarathon.com/api/v1

# Backend
APP_URL=https://api.indonesiamarathon.com
```

**CORS Configuration (Backend):**
```php
// config/cors.php
'allowed_origins' => [
    'https://app.indonesiamarathon.com',
],
```

---

## 🔍 Post-Deployment Testing

### 1. Test Sitemap Generation

```bash
# Test backend sitemap endpoint
curl https://indonesiamarathon.com/api/v1/sitemap

# Test frontend sitemap.xml
curl https://indonesiamarathon.com/sitemap.xml
```

**Expected Response:** XML sitemap dengan semua URLs dari backend

### 2. Test OG Images

**Tools:**
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator

**Test URLs:**
```
https://indonesiamarathon.com/
https://indonesiamarathon.com/event/borobudur-marathon-2025
https://indonesiamarathon.com/blog/apa-itu-marathon
```

**Expected:**
- Homepage: `og.webp` (fallback)
- Event: Event poster image
- Blog: Article banner image

### 3. Test Schema.org

**Tool:** Google Rich Results Test
- URL: https://search.google.com/test/rich-results

**Test:**
- Homepage: Organization schema
- Event detail: Event schema dengan offers
- Blog detail: Article schema dengan author

### 4. Test Meta Tags

**View Source (Right Click → View Page Source):**
```html
<!-- Homepage -->
<title>indonesiamarathon.com - Kalender Lari & Jadwal Marathon 2025</title>
<meta name="description" content="Platform digital #1..." />
<meta property="og:image" content="https://indonesiamarathon.com/og.webp" />

<!-- Event Detail -->
<title>Borobudur Marathon 2025 | indonesiamarathon.com</title>
<meta property="og:image" content="https://.../poster.webp" />
<script type="application/ld+json">{"@type":"Event",...}</script>
```

---

## 🐛 Troubleshooting

### Issue 1: Sitemap Empty atau Error

**Symptom:** `/sitemap.xml` kosong atau menunjukkan error

**Solution:**
```bash
# Test backend endpoint
curl http://localhost:8000/api/v1/sitemap

# Check Nuxt logs
pm2 logs frontend

# Verify environment variable
echo $NUXT_SITEMAP_API_URL
```

**Fix:**
- Pastikan `NUXT_SITEMAP_API_URL` bisa diakses dari Nuxt server
- Pastikan backend API endpoint return valid JSON
- Clear cache: `php artisan cache:clear`

---

### Issue 2: OG Image Tidak Muncul

**Symptom:** Social media share menampilkan broken image

**Solution:**
1. Verify file exists: `curl https://indonesiamarathon.com/og.webp`
2. Check file size < 8MB (Facebook limit)
3. Check image dimensions = 1200x630px
4. Clear Facebook cache: https://developers.facebook.com/tools/debug/

---

### Issue 3: Schema.org Invalid

**Symptom:** Google Rich Results Test menunjukkan error

**Solution:**
```bash
# View generated schema
curl https://indonesiamarathon.com/event/some-event | grep "application/ld+json"
```

**Common Fixes:**
- Pastikan `startDate` dalam format ISO 8601
- Pastikan `offers.price` adalah string angka
- Pastikan `location.address` lengkap

---

## 📊 Monitoring & Maintenance

### Google Search Console

**Setup:**
1. Verify ownership: https://search.google.com/search-console
2. Submit sitemap: `https://indonesiamarathon.com/sitemap.xml`
3. Monitor:
   - Coverage (halaman ter-index)
   - Enhancements (rich results)
   - Core Web Vitals
   - Mobile usability

### Cache Management

**Backend (Laravel):**
```bash
# Clear sitemap cache
php artisan cache:forget sitemap_urls

# Clear all cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

**Frontend (Nuxt):**
```bash
# Rebuild
npm run build

# Restart PM2
pm2 restart frontend
```

---

## 🎯 Performance Benchmarks

Target metrics setelah deployment:

| Metric | Target | Tool |
|--------|--------|------|
| Lighthouse Performance | > 90 | Chrome DevTools |
| Lighthouse SEO | 100 | Chrome DevTools |
| First Contentful Paint | < 1.8s | PageSpeed Insights |
| Largest Contentful Paint | < 2.5s | PageSpeed Insights |
| Time to Interactive | < 3.8s | PageSpeed Insights |
| Cumulative Layout Shift | < 0.1 | PageSpeed Insights |

---

## 📞 Support

Jika ada masalah saat deployment:

1. **Check Logs:**
   - Frontend: `pm2 logs frontend`
   - Backend: `tail -f storage/logs/laravel.log`

2. **Test Endpoints:**
   - Backend API: `curl https://domain.com/api/v1/sitemap`
   - Frontend SSR: `curl https://domain.com/`

3. **Verify Config:**
   - `cat frontend/.env`
   - `cat backend/.env`

---

**Last Updated:** ${new Date().toLocaleDateString('id-ID')}

