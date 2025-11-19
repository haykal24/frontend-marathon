# Dokploy Deployment Configuration

## Build Configuration

Dokploy akan menggunakan konfigurasi berikut untuk build:

1. **Node.js Version**: Node 20+ (dikonfigurasi di `package.json` field `engines`)
2. **Package Manager**: Bun (untuk install dan build yang lebih cepat)
3. **Install Command**: `bun install --frozen-lockfile`
4. **Build Command**: `bun run build`
5. **Start Command**: `bun run start`

## Konfigurasi di package.json

Semua konfigurasi deployment ada di `package.json`:

```json
{
  "engines": {
    "node": ">=20.0.0",
    "bun": ">=1.0.0"
  },
  "scripts": {
    "build": "nuxt build",
    "start": "bun .output/server/index.mjs"
  }
}
```

### Penjelasan Field `engines`

Field `engines` di `package.json` digunakan untuk:
- **Menspesifikasikan versi Node.js yang diperlukan**: `"node": ">=20.0.0"` berarti aplikasi memerlukan Node.js versi 20 atau lebih tinggi
- **Menspesifikasikan versi Bun yang diperlukan**: `"bun": ">=1.0.0"` berarti aplikasi memerlukan Bun versi 1.0.0 atau lebih tinggi

**Catatan tentang Node Version:**
- Dokploy/Nixpacks akan membaca versi Node dari beberapa sumber (prioritas):
  1. File `.nvmrc` atau `.node-version` (jika ada)
  2. Field `engines.node` di `package.json`
  3. Deteksi otomatis dari project structure
- **Rekomendasi**: Gunakan Node 20 untuk kompatibilitas yang lebih baik dengan Nuxt 4 dan ekosistem Vue 3
- Node 24 mungkin belum sepenuhnya didukung oleh semua tooling (Vite, Vue plugin, dll)
- File `.nvmrc` dan `.node-version` dibuat untuk memastikan Dokploy menggunakan Node 20

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

## Setup Dokploy

1. **Tidak perlu file `nixpacks.toml`** - Dokploy akan otomatis membaca konfigurasi dari `package.json`
2. **Install Bun**: Dokploy akan otomatis install Bun jika belum tersedia
3. **Build Process**: Dokploy akan menjalankan:
   - `bun install --frozen-lockfile` (install dependencies)
   - `bun run build` (build aplikasi)
   - `bun run start` (start aplikasi)

## Troubleshooting

### Error: Bun not found

**Solusi**: 
- Dokploy akan otomatis install Bun jika belum tersedia
- Pastikan field `engines.bun` ada di `package.json`

### Error: Cannot find module '@oxc-parser/binding-linux-x64-gnu'

**Solusi**: 
- Bun secara otomatis akan install platform-specific bindings
- Tidak perlu konfigurasi tambahan, Bun handle ini secara otomatis

### Node.js Version Warning

Jika ada warning tentang Node.js version:
- Dokploy akan membaca versi Node dari field `engines.node` di `package.json`
- Pastikan versi Node di Dokploy settings sesuai dengan requirement di `package.json`
- Jika ingin menggunakan Node 24, update `engines.node` menjadi `">=24.0.0"` dan pastikan Dokploy support Node 24

## Keuntungan Menggunakan Bun

- ⚡ **Lebih cepat**: Install dependencies 2-3x lebih cepat dari npm
- 🔒 **Lock file**: Menggunakan `bun.lockb` untuk reproducible builds
- 🎯 **Auto platform**: Otomatis install platform-specific packages yang tepat
- 📦 **Built-in**: Tidak perlu install npm/node_modules yang besar

## Files Configuration

- `package.json` - Konfigurasi build dan engines (Node.js & Bun version)
- `.nvmrc` - File untuk memastikan versi Node.js yang digunakan (Node 20)
- `.node-version` - File alternatif untuk versi Node.js (Node 20)
- `.dockerignore` - File yang di-ignore saat build Docker

**Catatan**: File `.nvmrc` dan `.node-version` membantu Dokploy/Nixpacks mendeteksi versi Node.js yang benar, karena `engines.node` di `package.json` tidak selalu dibaca dengan benar oleh semua build system.

