# 🎨 Cheat Sheet: Ukuran Gambar (Quick Reference)

Referensi cepat ukuran gambar untuk desainer. Print atau bookmark halaman ini saat mendesain.

---

## 🚀 Hero & Banner

### Hero Slider (Homepage)
**Slot:** `homepage_slider`  
**Lokasi:** Hero section homepage (full screen)
```
1920 × 1080px | 16:9 | WebP 75%
```
**Safe Area:** 80% tengah (hindari 10% pinggir)  
**Container:** Full viewport height (`h-screen`)  
**⚠️ Tidak ada varian mobile** (menggunakan gambar yang sama)

---

## 📢 Ad Banner (Banner Promo/Iklan)

### Banner Utama (Homepage)
**Slot:** `banner_main` (Desktop) / `banner_main_mobile` (Mobile)  
**Lokasi:** Section konten homepage (2/3 lebar)
```
Desktop: 1920 × 640px | 3:1 | WebP 75%
Mobile:  1200 × 720px | 5:3 | WebP 70%
```
**Container:** Desktop `min-h-[420px]` | Mobile `h-72` (288px)  
**Layout:** Desktop 2/3 lebar, Mobile full width slider

### Banner Sidebar (Homepage)
**Slot:** `sidebar_1` / `sidebar_2` (+ `_mobile`)  
**Lokasi:** Section konten homepage (1/3 lebar, vertikal)
```
Desktop: 900 × 400px | 9:4 | WebP 70%
Mobile:  1200 × 720px | 5:3 | WebP 70%
```
**Container:** Desktop `min-h-[200px]` per slot | Mobile `h-72` (digabung dengan main)  
**Layout:** Desktop 1/3 lebar (2 slot vertikal), Mobile digabung dalam slider

**Layout Desktop:**
```
┌─────────────────┬─────────┐
│ Banner Main     │ Sidebar │
│ (2/3 width)     │ 1 (1/3) │
│                 ├─────────┤
│                 │ Sidebar │
│                 │ 2 (1/3) │
└─────────────────┴─────────┘
```

---

## 📄 Page Header Banner

**Slot:** `page_header_*` (+ `_mobile`)  
**Lokasi:** Header berbagai halaman (dengan overlay teks)
```
1920 × 1080px | 16:9 | WebP 80%
```
**Container:** `h-[60vh]` (60% viewport height)  
**Quality:** 80% (lebih tinggi untuk branding)

**Slot Locations:**
- `page_header_events` - Listing event
- `page_header_event_detail` - Detail event
- `page_header_blog` - Listing blog
- `page_header_blog_detail` - Detail blog
- `page_header_faq` - FAQ
- `page_header_ekosistem` - Ekosistem
- `page_header_komunitas` - Direktori komunitas
- `page_header_race_management` - Direktori race management
- `page_header_vendor_medali` - Direktori vendor medali
- `page_header_vendor_jersey` - Direktori vendor jersey
- `page_header_vendor_fotografer` - Direktori vendor fotografer
- `page_header_rate_card` - Rate card

**Catatan:** Semua slot memiliki varian `_mobile` (contoh: `page_header_events_mobile`)

---

## 📋 Quick Reference: Semua Ad Banner Slots

| Slot Location | Ukuran Desktop | Ukuran Mobile | Quality | Container |
|---------------|----------------|---------------|---------|-----------|
| `homepage_slider` | 1920×1080 | 1920×1080 (sama) | 75% | Full screen |
| `banner_main` | 1920×640 | 1200×720 | 75% / 70% | 420px+ / 288px |
| `sidebar_1` | 900×400 | 1200×720 | 70% | 200px+ / 288px |
| `sidebar_2` | 900×400 | 1200×720 | 70% | 200px+ / 288px |
| `page_header_*` | 1920×1080 | 1920×1080 | 80% | 60vh |

**Catatan:**
- Semua slot (kecuali `homepage_slider`) memiliki varian `_mobile`
- Format: `[slot_name]_mobile` (contoh: `banner_main_mobile`)
- Jika varian mobile tidak ada, sistem fallback ke desktop banner

---

## 🎯 Event Images

### Event Poster (Detail)
```
1920 × 1080px | 16:9 | WebP 75%
```

### Event Card (Listing)
```
Desktop: 640 × 420px | 32:21 | WebP 70%
Mobile:  640 × 360px | 16:9  | WebP 70%
```

### Event Hero Card
```
640 × 400px | 8:5 | WebP 75%
```

---

## 📝 Blog Images

### Blog Banner
```
1920 × 1080px | 16:9 | WebP 75%
⚠️ Optimasi manual sebelum upload (max 500KB)
```

### Blog Card
```
800 × 500px | 8:5 | WebP 70%
```

---

## 🏢 Logo & Branding

### Vendor Logo
```
800 × 800px | 1:1 | WebP 75%
Thumbnail: 400 × 400px | 1:1 | WebP 70%
```

### Community Logo
```
800 × 800px | 1:1 | WebP 75%
Thumbnail: 400 × 400px | 1:1 | WebP 70%
```

### Site Logo (Header/Footer)
```
200 × 60px | 10:3 | PNG/SVG (transparan)
```

---

## 📱 Social Media

### Open Graph (OG) Image
```
1200 × 630px | 1.91:1 | WebP 80%
⚠️ Safe area: 80% tengah (hindari 10% pinggir)
```

### Twitter Card
```
Summary: 1200 × 630px | 1.91:1 | WebP 80%
Large:   1200 × 1200px | 1:1   | WebP 80%
```

---

## 📊 File Size Limits

| Tipe | Max Original | Target WebP |
|------|--------------|-------------|
| Hero Slider | 2MB | < 300KB |
| Ad Banner (Main) | 2MB | < 300KB |
| Ad Banner (Sidebar) | 1.5MB | < 200KB |
| Page Header | 2MB | < 300KB |
| Event Poster | 3MB | < 400KB |
| Event Card | 1MB | < 150KB |
| Logo | 500KB | < 100KB |
| OG Image | 1MB | < 200KB |

---

## ✅ Checklist Sebelum Upload

- [ ] Ukuran sesuai tabel di atas
- [ ] Aspect ratio benar (tidak stretch)
- [ ] File size < limit (lihat tabel)
- [ ] Kompres dengan Squoosh/TinyPNG
- [ ] Teks penting di center-safe area (80% tengah)
- [ ] Format: JPG/PNG (akan auto-convert ke WebP)
- [ ] **Ad Banner:** Pastikan slot location benar (`banner_main`, `sidebar_1`, dll)
- [ ] **Ad Banner:** Buat varian mobile jika diperlukan (`_mobile` suffix)

---

## 🛠️ Tools Rekomendasi

- **Kompres:** [Squoosh.app](https://squoosh.app)
- **Desain:** Figma, Canva
- **Convert:** [TinyPNG](https://tinypng.com)

---

**📖 Dokumentasi Lengkap:** `frontend/docs/UKURAN_GAMBAR.md`

