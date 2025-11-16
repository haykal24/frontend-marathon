# Backend Requirements untuk Frontend

Dokumen ini merinci endpoint API dan struktur data yang diperlukan oleh frontend.

## 1. Event Types (Jenis Event)

### Endpoint: `GET /api/v1/event-types`

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Trail Run",
      "slug": "trail-run",
      "description": "Event lari di jalur trail",
      "image": "https://example.com/images/trail-run.jpg",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    }
  ]
}
```

### Endpoint: `GET /api/v1/event-types/{slug}`

**Response:**

```json
{
  "data": {
    "id": 1,
    "name": "Trail Run",
    "slug": "trail-run",
    "description": "Event lari di jalur trail",
    "image": "https://example.com/images/trail-run.jpg",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  }
}
```

### Database Schema

**Table: `event_types`**

```sql
CREATE TABLE event_types (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NULL,
  image VARCHAR(255) NULL, -- URL ke Spatie Media Library
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

**Catatan:**

- Event types harus bisa ditambah/diedit di Filament Admin (seperti kategori)
- Field `image` menggunakan Spatie Media Library (otomatis WebP)
- Field `is_active` untuk enable/disable jenis event

---

## 2. Provinces (Provinsi)

### Endpoint: `GET /api/v1/provinces`

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Jakarta",
      "slug": "jakarta",
      "thumbnail": "https://example.com/images/jakarta-thumb.jpg",
      "description": "DKI Jakarta",
      "is_active": true,
      "event_count": 150,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    }
  ]
}
```

### Endpoint: `GET /api/v1/provinces/{slug}`

**Response:**

```json
{
  "data": {
    "id": 1,
    "name": "Jakarta",
    "slug": "jakarta",
    "thumbnail": "https://example.com/images/jakarta-thumb.jpg",
    "description": "DKI Jakarta",
    "is_active": true,
    "event_count": 150,
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  }
}
```

### Database Schema

**Table: `provinces`**

```sql
CREATE TABLE provinces (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  thumbnail VARCHAR(255) NULL, -- URL ke Spatie Media Library
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

**Catatan:**

- Provinces harus bisa ditambah/diedit di Filament Admin
- Field `thumbnail` menggunakan Spatie Media Library (otomatis WebP)
- Field `event_count` dihitung dari relasi dengan tabel `events` (via `city` atau field `province_id` jika ada)
- Provinsi besar yang perlu ditambahkan: Jakarta, Jawa Barat, Jawa Tengah, Jawa Timur, Bali, Sumatera Utara, Yogyakarta

### Migration untuk Menambah Province ke Events

**Opsi 1: Tambah field `province_id` ke tabel `events`**

```sql
ALTER TABLE events ADD COLUMN province_id BIGINT UNSIGNED NULL;
ALTER TABLE events ADD FOREIGN KEY (province_id) REFERENCES provinces(id);
```

**Opsi 2: Gunakan field `city` yang sudah ada dan mapping manual**

- Buat mapping `city` -> `province` di backend
- Atau tambah field `province` di tabel `events` (VARCHAR)

---

## 3. Events API (Update)

### Endpoint: `GET /api/v1/events`

**Query Parameters:**

- `page` (int): Halaman
- `per_page` (int): Jumlah per halaman
- `type` (string): Filter by event type slug
- `city` (string): Filter by city
- `province` (string): Filter by province slug
- `category` (string): Filter by category slug
- `status` (string): Filter by status (published, pending_review, draft)
- `search` (string): Search query
- `sort` (string): Sort by (latest, upcoming, popular)

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Jakarta Marathon 2025",
      "slug": "jakarta-marathon-2025",
      "description": "Event marathon di Jakarta",
      "image": "https://example.com/images/event.jpg",
      "location_name": "Gelora Bung Karno",
      "city": "Jakarta",
      "province": "Jakarta", // atau null jika belum ada
      "event_date": "2025-06-15",
      "event_end_date": null,
      "event_type": "marathon",
      "registration_url": "https://example.com/register",
      "organizer_name": "Jakarta Running Festival",
      "benefits": ["Jersey", "Medali", "Finisher T-Shirt"],
      "contact_info": {
        "WhatsApp": "0812 3456 7890",
        "Instagram": "@jakartamarathon"
      },
      "registration_fees": {
        "5K": "IDR 250.000",
        "10K": "IDR 350.000"
      },
      "social_media": {
        "IG": ["@jakartamarathon"]
      },
      "status": "published",
      "seo_title": "Jakarta Marathon 2025 - Daftar Sekarang",
      "seo_description": "Event marathon terbesar di Jakarta",
      "categories": [
        {
          "id": 1,
          "name": "5K",
          "slug": "5k"
        }
      ],
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 12,
    "total": 120
  }
}
```

---

## 4. Blog Posts API

### Endpoint: `GET /api/v1/blog/posts`

**Query Parameters:**

- `page` (int): Halaman
- `per_page` (int): Jumlah per halaman
- `category` (string): Filter by category slug
- `author` (string): Filter by author ID
- `search` (string): Search query

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Program Latihan Half Marathon Pemula",
      "slug": "program-latihan-half-marathon-pemula",
      "excerpt": "Panduan lengkap untuk pemula...",
      "banner": "https://example.com/images/blog.jpg",
      "content": "...",
      "published_at": "2025-01-15T00:00:00.000000Z",
      "author": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "photo": "https://example.com/photo.jpg",
        "bio": "Running coach"
      },
      "category": {
        "id": 1,
        "name": "Latihan",
        "slug": "latihan",
        "description": "Artikel tentang latihan"
      },
      "seo_title": "Program Latihan Half Marathon Pemula - Panduan Lengkap",
      "seo_description": "Pelajari cara latihan untuk half marathon...",
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 12,
    "total": 60
  }
}
```

---

## 5. Ad Banners API

### Endpoint: `GET /api/v1/ad-banners`

**Query Parameters:**

- `slot_location` (string): Filter by slot location (homepage_slider, homepage_cta, sidebar_event)
- `is_active` (boolean): Filter by active status

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Slider Homepage - EO A",
      "image": "https://example.com/images/banner.jpg",
      "target_url": "https://example.com/promo",
      "slot_location": "homepage_slider",
      "is_active": true,
      "expires_at": "2025-12-31T23:59:59.000000Z",
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

## 6. Filament Admin Resources

### Event Types Resource

**File: `app/Filament/Resources/EventTypeResource.php`**

```php
<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EventTypeResource\Pages;
use App\Models\EventType;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use FilamentSpatieMediaLibraryPlugin\Forms\Components\SpatieMediaLibraryFileUpload;

class EventTypeResource extends Resource
{
    protected static ?string $model = EventType::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';

    protected static ?string $navigationGroup = 'Manajemen Event';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('slug')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                Forms\Components\Textarea::make('description')
                    ->rows(3),
                SpatieMediaLibraryFileUpload::make('image')
                    ->collection('default')
                    ->image()
                    ->imageEditor()
                    ->conversion('webp'),
                Forms\Components\Toggle::make('is_active')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('slug')
                    ->searchable(),
                Tables\Columns\ImageColumn::make('image')
                    ->collection('default')
                    ->conversion('webp'),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEventTypes::route('/'),
            'create' => Pages\CreateEventType::route('/create'),
            'edit' => Pages\EditEventType::route('/{record}/edit'),
        ];
    }
}
```

### Province Resource

**File: `app/Filament/Resources/ProvinceResource.php`**

```php
<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProvinceResource\Pages;
use App\Models\Province;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use FilamentSpatieMediaLibraryPlugin\Forms\Components\SpatieMediaLibraryFileUpload;

class ProvinceResource extends Resource
{
    protected static ?string $model = Province::class;

    protected static ?string $navigationIcon = 'heroicon-o-map';

    protected static ?string $navigationGroup = 'Manajemen Event';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('slug')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                Forms\Components\Textarea::make('description')
                    ->rows(3),
                SpatieMediaLibraryFileUpload::make('thumbnail')
                    ->collection('default')
                    ->image()
                    ->imageEditor()
                    ->conversion('webp')
                    ->label('Thumbnail (untuk homepage)'),
                Forms\Components\Toggle::make('is_active')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('slug')
                    ->searchable(),
                Tables\Columns\ImageColumn::make('thumbnail')
                    ->collection('default')
                    ->conversion('webp'),
                Tables\Columns\TextColumn::make('event_count')
                    ->counts('events')
                    ->label('Event Count'),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProvinces::route('/'),
            'create' => Pages\CreateProvince::route('/create'),
            'edit' => Pages\EditProvince::route('/{record}/edit'),
        ];
    }
}
```

---

## 7. Model Laravel

### EventType Model

**File: `app/Models/EventType.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class EventType extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('webp')
            ->format('webp')
            ->quality(80);
    }

    public function getImageAttribute(): ?string
    {
        $media = $this->getFirstMedia('default');
        return $media ? $media->getUrl('webp') : null;
    }
}
```

### Province Model

**File: `app/Models/Province.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Province extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('webp')
            ->format('webp')
            ->quality(80);
    }

    public function getThumbnailAttribute(): ?string
    {
        $media = $this->getFirstMedia('default');
        return $media ? $media->getUrl('webp') : null;
    }

    public function getEventCountAttribute(): int
    {
        // Hitung dari events berdasarkan city atau province_id
        return Event::where('city', $this->name)->count();
        // atau jika ada province_id:
        // return $this->events()->count();
    }
}
```

---

## 8. API Controllers

### EventTypeController

**File: `app/Http/Controllers/Api/EventTypeController.php`**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EventType;
use Illuminate\Http\JsonResponse;

class EventTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $types = EventType::where('is_active', true)->get();

        return response()->json([
            'data' => $types->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'slug' => $type->slug,
                    'description' => $type->description,
                    'image' => $type->image,
                    'is_active' => $type->is_active,
                    'created_at' => $type->created_at,
                    'updated_at' => $type->updated_at,
                ];
            }),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $type = EventType::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return response()->json([
            'data' => [
                'id' => $type->id,
                'name' => $type->name,
                'slug' => $type->slug,
                'description' => $type->description,
                'image' => $type->image,
                'is_active' => $type->is_active,
                'created_at' => $type->created_at,
                'updated_at' => $type->updated_at,
            ],
        ]);
    }
}
```

### ProvinceController

**File: `app/Http/Controllers/Api/ProvinceController.php`**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Province;
use Illuminate\Http\JsonResponse;

class ProvinceController extends Controller
{
    public function index(): JsonResponse
    {
        $provinces = Province::where('is_active', true)
            ->get()
            ->map(function ($province) {
                return [
                    'id' => $province->id,
                    'name' => $province->name,
                    'slug' => $province->slug,
                    'thumbnail' => $province->thumbnail,
                    'description' => $province->description,
                    'is_active' => $province->is_active,
                    'event_count' => $province->event_count,
                    'created_at' => $province->created_at,
                    'updated_at' => $province->updated_at,
                ];
            });

        return response()->json([
            'data' => $provinces,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $province = Province::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return response()->json([
            'data' => [
                'id' => $province->id,
                'name' => $province->name,
                'slug' => $province->slug,
                'thumbnail' => $province->thumbnail,
                'description' => $province->description,
                'is_active' => $province->is_active,
                'event_count' => $province->event_count,
                'created_at' => $province->created_at,
                'updated_at' => $province->updated_at,
            ],
        ]);
    }
}
```

---

## 9. Routes

**File: `routes/api.php`**

```php
// Event Types
Route::get('/event-types', [EventTypeController::class, 'index']);
Route::get('/event-types/{slug}', [EventTypeController::class, 'show']);

// Provinces
Route::get('/provinces', [ProvinceController::class, 'index']);
Route::get('/provinces/{slug}', [ProvinceController::class, 'show']);

// Events (update untuk support province filter)
Route::get('/events', [EventController::class, 'index']);
// ... existing routes
```

---

## Summary

**Yang perlu ditambahkan di Backend:**

1. ✅ **Tabel `event_types`** - CRUD di Filament, dengan field `image` (Spatie Media Library)
2. ✅ **Tabel `provinces`** - CRUD di Filament, dengan field `thumbnail` (Spatie Media Library)
3. ✅ **Update tabel `events`** - Tambah field `province` atau `province_id` (opsional, bisa mapping dari `city`)
4. ✅ **API Endpoints** - `/event-types`, `/provinces`, update `/events` untuk support filter `province`
5. ✅ **Filament Resources** - EventTypeResource, ProvinceResource

**Catatan Penting:**

- Semua gambar (event_types.image, provinces.thumbnail) menggunakan Spatie Media Library dengan konversi WebP otomatis
- Event types dan provinces harus bisa diaktifkan/nonaktifkan via `is_active`
- Provinsi besar yang perlu ditambahkan: Jakarta, Jawa Barat, Jawa Tengah, Jawa Timur, Bali, Sumatera Utara, Yogyakarta
