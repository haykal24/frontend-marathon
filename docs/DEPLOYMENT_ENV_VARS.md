# Environment Variables untuk Production Deployment

## 🚨 **CRITICAL: Environment Variables Wajib**

Untuk memastikan **Schema.org `sameAs`** dan data dinamis lainnya ter-load dengan benar di production, pastikan environment variables berikut sudah di-set di server/hosting Anda:

---

## 📋 **Required Environment Variables**

### 1. **Site URL (Public)**
```bash
NUXT_PUBLIC_SITE_URL=https://indonesiamarathon.com
```
- **Digunakan untuk**: Canonical URLs, OG images, Schema.org URLs
- **Wajib**: Ya
- **Default**: `http://localhost:3000` (development)

### 2. **API Base URL (Public - Client-side)**
```bash
NUXT_PUBLIC_API_BASE=https://indonesiamarathon.com/api/v1
```
- **Digunakan untuk**: Client-side API requests (fetch data di browser)
- **Wajib**: Ya
- **Default**: `http://localhost:8000/api/v1` (development)

### 3. **API Base URL (Server-side - SSR)**
```bash
NUXT_API_BASE=https://indonesiamarathon.com/api/v1
```
- **Digunakan untuk**: Server-side rendering (SSR) API requests
- **Wajib**: Ya (untuk SSR)
- **Rekomendasi**: Gunakan internal network URL jika tersedia untuk performa lebih baik
  - Contoh: `http://localhost:8000/api/v1` (jika Laravel dan Nuxt di server yang sama)
  - Atau: `http://backend-service:8000/api/v1` (jika menggunakan Docker)

### 4. **App Name**
```bash
NUXT_PUBLIC_APP_NAME=Indonesia Marathon
```
- **Digunakan untuk**: App title, PWA manifest
- **Wajib**: Tidak (ada fallback)
- **Default**: `Marathon Indonesia`

### 5. **Node Environment**
```bash
NODE_ENV=production
```
- **Digunakan untuk**: Build optimization, error handling
- **Wajib**: Ya
- **Default**: `development`

---

## 🔧 **Cara Set Environment Variables**

### **A. Vercel**
1. Buka project di Vercel Dashboard
2. Settings → Environment Variables
3. Tambahkan semua variables di atas
4. Redeploy project

### **B. Netlify**
1. Buka project di Netlify Dashboard
2. Site settings → Environment variables
3. Tambahkan semua variables di atas
4. Redeploy project

### **C. VPS / Dedicated Server (PM2)**
1. Buat file `.env` di root folder `frontend/`:
   ```bash
   cd /path/to/marathon/frontend
   nano .env
   ```
2. Paste environment variables:
   ```bash
   NUXT_PUBLIC_SITE_URL=https://indonesiamarathon.com
   NUXT_PUBLIC_API_BASE=https://indonesiamarathon.com/api/v1
   NUXT_API_BASE=http://localhost:8000/api/v1
   NUXT_PUBLIC_APP_NAME=Indonesia Marathon
   NODE_ENV=production
   ```
3. Save dan restart PM2:
   ```bash
   pm2 restart nuxt-app
   ```

### **D. Docker / Docker Compose**
Tambahkan di `docker-compose.yml`:
```yaml
services:
  nuxt:
    environment:
      - NUXT_PUBLIC_SITE_URL=https://indonesiamarathon.com
      - NUXT_PUBLIC_API_BASE=https://indonesiamarathon.com/api/v1
      - NUXT_API_BASE=http://backend:8000/api/v1
      - NUXT_PUBLIC_APP_NAME=Indonesia Marathon
      - NODE_ENV=production
```

---

## 🧪 **Testing Environment Variables**

### **1. Check di Server**
SSH ke server dan jalankan:
```bash
cd /path/to/marathon/frontend
node -e "console.log(process.env.NUXT_PUBLIC_API_BASE)"
```

### **2. Check di Browser (Production)**
1. Buka `https://indonesiamarathon.com/`
2. View Page Source (Ctrl+U)
3. Cari `<script type="application/ld+json">`
4. Verifikasi `sameAs` tidak kosong `[]`

**Expected Result:**
```json
{
  "@type": "Organization",
  "sameAs": [
    "https://www.instagram.com/indonesiamarathon",
    "https://www.facebook.com/indonesiamarathon",
    "https://twitter.com/indomarathon"
  ]
}
```

---

## ⚠️ **Troubleshooting**

### **Problem: `sameAs` masih kosong `[]` di production**

**Root Cause:**
- Backend API tidak bisa diakses dari Nuxt SSR
- Environment variable `NUXT_API_BASE` tidak di-set atau salah

**Solution:**
1. Verifikasi API URL bisa diakses dari server:
   ```bash
   curl https://indonesiamarathon.com/api/v1/site-settings
   ```
2. Jika menggunakan internal network, pastikan Laravel dan Nuxt bisa saling akses
3. Check logs untuk error:
   ```bash
   pm2 logs nuxt-app --lines 100
   ```

### **Problem: CORS error saat fetch site settings**

**Root Cause:**
- Laravel backend belum configure CORS untuk domain production

**Solution:**
Edit `backend/config/cors.php`:
```php
'allowed_origins' => [
    'https://indonesiamarathon.com',
],
```

---

## ✅ **Checklist Deployment**

Sebelum deploy ke production, pastikan:

- [ ] Semua environment variables sudah di-set di hosting
- [ ] `NUXT_PUBLIC_API_BASE` mengarah ke Laravel backend production
- [ ] `NUXT_API_BASE` bisa diakses dari server Nuxt (test dengan `curl`)
- [ ] Laravel backend sudah seeded dengan `SiteSettingSeeder`
- [ ] Test endpoint `/api/v1/site-settings` return data yang benar
- [ ] Rebuild Nuxt app setelah set environment variables
- [ ] Test Schema.org di production dengan Google Rich Results Test

---

## 📚 **Related Documentation**

- [Nuxt Runtime Config](https://nuxt.com/docs/guide/going-further/runtime-config)
- [Environment Variables Best Practices](https://12factor.net/config)
- [Schema.org Organization](https://schema.org/Organization)

