# Frontend - Marathon Platform

Nuxt 4 SSR (Server-Side Rendering) aplikasi untuk Marathon platform dengan SEO optimization.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

## 📋 Environment Variables

Create `.env.production` untuk production:

```env
NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
NUXT_PUBLIC_SITE_URL=https://yourdomain.com
NUXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## 📂 Project Structure

```
frontend/
├── components/          # Reusable Vue components
├── composables/         # Vue composables (hooks)
├── layouts/            # Page layouts
├── pages/              # Route pages (auto-routed)
├── public/             # Static assets
├── server/             # Nitro server routes
├── app.vue             # Root component
├── nuxt.config.ts      # Nuxt configuration
└── tailwind.config.ts  # Tailwind CSS config
```

## 🎨 Key Pages

- `/` - Homepage
- `/agenda-lari` - Events calendar
- `/mitra/login` - EO/Vendor login
- `/mitra/dashboard` - EO dashboard
- `/blog` - Blog articles
- `/direktori/*` - Directory pages

## 🔐 Authentication

Menggunakan **WA OTP** untuk login (backend handle, frontend consume).

```ts
// Login flow:
1. User kirim nomor HP
2. Backend send OTP via Whatsapp
3. User verify OTP
4. Get Sanctum token
5. Store di Pinia store
```

## 🎯 SEO Features

- **@nuxtjs/seo** untuk meta tags
- **@nuxt/image** untuk image optimization
- **Dynamic sitemap** generation
- **Schema.org** structured data
- **SSR** untuk better indexing

## 🚀 Deployment

### Automated (GitHub Actions)
Push ke branch `master` akan auto-build & deploy ke server.

**Requirements:**
- Set GitHub Secrets:
  - `SERVER_HOST`
  - `SERVER_USER`
  - `SERVER_SSH_KEY` (base64 encoded)
  - `FRONTEND_DEPLOY_PATH`
  - `NUXT_API_BASE`
  - `NUXT_SITE_URL`

### Manual
```bash
# 1. Build
npm run build

# 2. Upload .output/ via SFTP

# 3. SSH ke server:
cd /path/to/app
pm2 restart marathon-frontend
pm2 save
```

## 🔧 PM2 Setup (Production)

Create `ecosystem.config.js`:

```js
module.exports = {
  apps: [{
    name: 'marathon-frontend',
    script: './.output/server/index.mjs',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Start:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📚 Documentation

- Nuxt: https://nuxt.com
- Vue 3: https://vuejs.org
- Tailwind: https://tailwindcss.com
- SEO Module: https://nuxt.com/modules/seo
