# Dokploy Deployment Configuration

## Build Configuration

Dokploy akan menggunakan konfigurasi berikut untuk build:

1. **Node.js Version**: Node 20 (dikonfigurasi di `nixpacks.toml`)
2. **Package Manager**: Bun (untuk install dan build yang lebih cepat)
3. **Install Command**: `bun install --frozen-lockfile`
4. **Build Command**: `bun run build`
5. **Start Command**: `bun run start`

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

### Error: Bun not found

**Solusi**: 
- `nixpacks.toml` sudah dikonfigurasi untuk install Bun secara otomatis
- Bun akan diinstall via curl script di fase install
- Pastikan `nixpacks.toml` ada di repository

### Error: Cannot find module '@oxc-parser/binding-linux-x64-gnu'

**Solusi**: 
- Bun secara otomatis akan install platform-specific bindings
- Tidak perlu konfigurasi tambahan, Bun handle ini secara otomatis

### Node.js Version Warning

Jika ada warning tentang Node.js version:
- Dokploy akan menggunakan Node 20 (dari `nixpacks.toml`)
- Jika masih menggunakan Node 18, update di Dokploy settings → Build Settings → Node Version

## Keuntungan Menggunakan Bun

- ⚡ **Lebih cepat**: Install dependencies 2-3x lebih cepat dari npm
- 🔒 **Lock file**: Menggunakan `bun.lockb` untuk reproducible builds
- 🎯 **Auto platform**: Otomatis install platform-specific packages yang tepat
- 📦 **Built-in**: Tidak perlu install npm/node_modules yang besar

## Files Created

- `nixpacks.toml` - Konfigurasi build untuk Dokploy/Nixpacks (menggunakan Bun)
- `.dockerignore` - File yang di-ignore saat build Docker

