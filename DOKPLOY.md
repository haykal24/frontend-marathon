# Dokploy Deployment Configuration

## Build Configuration

Dokploy akan menggunakan konfigurasi berikut untuk build:

1. **Node.js Version**: Node 20 (dikonfigurasi di `nixpacks.toml`)
2. **Install Command**: `npm ci --omit=optional` atau `npm install --omit=optional`
3. **Build Command**: `npm run build`
4. **Start Command**: `npm run start`

## Environment Variables

Pastikan set environment variables berikut di Dokploy:

```
NODE_ENV=production
NUXT_PUBLIC_API_BASE=https://your-api-domain.com/api/v1
NUXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NUXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
NUXT_PUBLIC_APP_NAME=Indonesia Marathon
PORT=3000
```

## Troubleshooting

### Error: Unsupported platform for @oxc-parser/binding-win32-x64-msvc

**Solusi**: File `.npmrc` sudah dikonfigurasi untuk skip optional dependencies. Jika masih error:

1. Pastikan `.npmrc` ada di repository dengan `optional=false`
2. Atau set environment variable di Dokploy: `NPM_CONFIG_OPTIONAL=false`

### Node.js Version Warning

Jika ada warning tentang Node.js version:
- Dokploy akan menggunakan Node 20 (dari `nixpacks.toml`)
- Jika masih menggunakan Node 18, update di Dokploy settings → Build Settings → Node Version

## Files Created

- `.npmrc` - Konfigurasi npm untuk skip optional dependencies
- `nixpacks.toml` - Konfigurasi build untuk Dokploy/Nixpacks
- `.dockerignore` - File yang di-ignore saat build Docker

