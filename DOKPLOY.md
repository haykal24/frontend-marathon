# Dokploy Deployment Configuration

## Build Configuration

Dokploy akan menggunakan konfigurasi berikut untuk build:

1. **Node.js Version**: Node 24 (dikonfigurasi di `nixpacks.toml`)
2. **Package Manager**: Bun (untuk install dan build yang lebih cepat)
3. **Install Command**: `bun install --frozen-lockfile`
4. **Build Command**: `bun run build`
5. **Start Command**: `bun run start`

## Konfigurasi di nixpacks.toml

Semua konfigurasi deployment ada di `nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["nodejs_24", "bun"]

[phases.install]
cmds = [
  "bun install --frozen-lockfile"
]

[phases.build]
cmds = [
  "bun run build"
]

[start]
cmd = "bun run start"
```

### Penjelasan Konfigurasi

- **`[phases.setup]`**: Mendefinisikan paket yang diperlukan (Node.js 24 dan Bun)
- **`[phases.install]`**: Menjalankan install dependencies menggunakan Bun dengan `--frozen-lockfile` untuk reproducible builds
- **`[phases.build]`**: Menjalankan build aplikasi
- **`[start]`**: Command untuk start aplikasi setelah deployment

**Catatan tentang Node 24:**
- Node 24 digunakan untuk performa dan fitur terbaru
- Pastikan semua dependencies kompatibel dengan Node 24
- Jika ada masalah kompatibilitas, pertimbangkan untuk kembali ke Node 20

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

1. **File `nixpacks.toml`** - Dokploy akan membaca konfigurasi dari file ini (prioritas tertinggi)
2. **Node.js 24 & Bun**: Keduanya akan diinstall otomatis dari Nixpacks
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

- `nixpacks.toml` - Konfigurasi build untuk Dokploy/Nixpacks (Node.js 24 & Bun)
- `package.json` - Konfigurasi project dan scripts
- `.dockerignore` - File yang di-ignore saat build Docker

**Catatan**: File `nixpacks.toml` adalah sumber konfigurasi utama untuk Dokploy. Ini memiliki prioritas tertinggi dan akan digunakan untuk menentukan versi Node.js dan proses build.

