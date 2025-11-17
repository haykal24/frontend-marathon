/**
 * SEO Keywords Database - Hasil Research Final
 * Semua keyword yang ditargetkan dengan prioritas dan implementasi
 * Updated: 2025
 */

export interface KeywordCluster {
  primary: string // Keyword utama
  secondaries: string[] // Related keywords
  relatedQuestions: string[] // Search intent
  priority: 'high' | 'medium' | 'low'
  targetPage: string // Halaman yang target keyword ini
  description: string // Untuk SEO description
  
  // PEOPLE-FIRST ENHANCEMENT
  type?: 'informational' | 'navigational' | 'local' | 'ecosystem' // Tipe keyword
  contextualFaqs?: {
    // FAQ spesifik per page type (misal: event FAQ berbeda dengan blog FAQ)
    event?: string[]
    blog?: string[]
    listing?: string[]
    detail?: string[]
  }
  description_variants?: string[] // Multiple description options untuk card yang variatif
  answerTemplates?: {
    // Multiple answer templates per question untuk variasi
    [key: string]: string[]
  }
  hints?: string // Tips untuk content creator supaya nggak sembarangan (dalam comments)
}

export const SEO_KEYWORDS: Record<string, KeywordCluster> = {
  // ========== INFORMATIONAL KEYWORDS ==========
  marathon: {
    primary: 'Marathon',
    secondaries: ['apa itu marathon', 'marathon berapa km', 'lari marathon', 'marathon 2025'],
    relatedQuestions: [
      'Apa itu marathon?',
      'Marathon berapa kilometer?',
      'Bagaimana cara latihan marathon?',
      'Marathon memerlukan kondisi fisik apa?',
    ],
    priority: 'high',
    targetPage: '/blog/apa-itu-marathon-jarak-lari',
    description:
      'Panduan lengkap marathon: definisi, jarak, teknik latihan, dan tips menjalankan marathon hingga finish line untuk pemula hingga advanced.',
    
    // PEOPLE-FIRST ENHANCEMENT
    type: 'informational',
    contextualFaqs: {
      blog: [
        'Apa itu marathon?',
        'Marathon berapa kilometer?',
        'Bagaimana cara latihan marathon?',
        'Marathon memerlukan kondisi fisik apa?',
      ],
      event: [
        'Apa persyaratan minimal untuk mengikuti marathon ini?',
        'Bagaimana sistem kategori jarak di event ini?',
        'Kapan cut off time marathon ini?',
      ],
    },
    description_variants: [
      'Panduan lengkap marathon: definisi, jarak, teknik latihan, dan tips menjalankan marathon hingga finish line untuk pemula hingga advanced.',
      'Marathon adalah lari jarak 42.195 km yang menguji stamina dan mental. Pelajari teknik latihan, persiapan fisik, dan strategi menjalani marathon.',
      'Ingin menjalankan marathon? Baca panduan lengkap marathon: apa itu, berapa jauhnya, cara latihan, tips finish line, dan tips recovery.',
    ],
    answerTemplates: {
      'Apa itu marathon?': [
        'Marathon adalah lari jarak 42.195 km yang menguji ketahanan fisik dan mental peserta. Ini adalah salah satu event olahraga paling ikonik di dunia.',
        'Marathon merupakan event lari yang mengukur stamina dan ketekunan peserta dalam menempuh jarak 42.195 kilometer tanpa henti.',
      ],
      'Marathon berapa kilometer?': [
        'Marathon standar internasional adalah 42.195 kilometer. Jarak ini sudah ditetapkan sejak Olimpik modern pertama tahun 1896.',
        'Jarak marathon yang resmi adalah 42 kilometer 195 meter (42.195 km). Ini adalah standar untuk semua event marathon di dunia.',
      ],
    },
    hints: 'Untuk event detail, tanya tentang kategori jarak, cut off time, dan persyaratan. Jangan hanya copy-paste general FAQ dari blog.',
  },

  halfMarathon: {
    primary: 'Half Marathon',
    secondaries: ['half marathon berapa km', 'apa itu half marathon', 'half marathon artinya'],
    relatedQuestions: [
      'Half marathon berapa kilometer?',
      'Apa perbedaan marathon dan half marathon?',
      'Bagaimana cara latihan half marathon?',
    ],
    priority: 'high',
    targetPage: '/blog/apa-itu-marathon-jarak-lari',
    description:
      'Penjelasan half marathon: jarak tempuh, perbedaan dengan marathon, program latihan, dan tips sukses menyelesaikan half marathon.',
  },

  pace: {
    primary: 'Pace Lari',
    secondaries: ['pace adalah', 'pace lari', 'cara menghitung pace', 'pace 5k 10k marathon'],
    relatedQuestions: [
      'Apa itu pace?',
      'Bagaimana cara menghitung pace lari?',
      'Pace ideal untuk lari marathon?',
      'Pace lari 5K berapa km/jam?',
    ],
    priority: 'high',
    targetPage: '/blog/pace-adalah-cara-menghitung',
    description:
      'Panduan pace lari: definisi, cara menghitung, pace ideal per distance (5K, 10K, half marathon, marathon), dan tips meningkatkan kecepatan.',
  },

  cutOff: {
    primary: 'Cut Off',
    secondaries: ['cut off adalah', 'cut off marathon', 'apa itu cut off lari', 'cut off time'],
    relatedQuestions: [
      'Apa itu cut off?',
      'Cut off marathon berapa jam?',
      'Apa yang terjadi jika melampaui cut off?',
      'Bagaimana mempercepat pace untuk hindari cut off?',
    ],
    priority: 'high',
    targetPage: '/blog/cut-off-adalah',
    description:
      'Cut off marathon: pengertian, waktu cut off standar, konsekuensi melampaui batas waktu, dan strategi agar tidak terkena cut off.',
  },

  funRun: {
    primary: 'Fun Run',
    secondaries: [
      'fun run adalah',
      'fun run artinya',
      'fun run marathon',
      'perbedaan fun run dan lari biasa',
    ],
    relatedQuestions: [
      'Apa itu fun run?',
      'Apa artinya fun run?',
      'Perbedaan fun run dan marathon?',
      'Apa tujuan fun run?',
    ],
    priority: 'high',
    targetPage: '/blog/fun-run-artinya',
    description:
      'Fun run: pengertian, karakteristik, perbedaan dengan marathon atau lari kompetitif, dan keuntungan mengikuti fun run untuk pemula.',
  },

  trailRun: {
    primary: 'Trail Run',
    secondaries: [
      'trail run adalah',
      'trail running',
      'trail run pemula',
      'perbedaan trail run dan road run',
    ],
    relatedQuestions: [
      'Apa itu trail run?',
      'Apa perbedaan trail run dan road run?',
      'Bagaimana tips trail running untuk pemula?',
      'Perlengkapan apa yang dibutuhkan untuk trail run?',
    ],
    priority: 'high',
    targetPage: '/blog/panduan-trail-running-pemula',
    description:
      'Panduan trail running: definisi, perbedaan dari road run, teknik, perlengkapan, dan tips keselamatan trail running untuk pemula.',
  },

  // ========== NAVIGATIONAL KEYWORDS ==========
  marathonIndonesia: {
    primary: 'Marathon Indonesia',
    secondaries: [
      'jadwal marathon indonesia',
      'marathon 2025 indonesia',
      'marathon bandung',
      'marathon jakarta',
    ],
    relatedQuestions: [
      'Marathon apa saja di Indonesia tahun 2025?',
      'Jadwal marathon 2025 Indonesia?',
      'Marathon di kota saya kapan?',
    ],
    priority: 'high',
    targetPage: '/event?type=marathon',
    description:
      'Jadwal lengkap marathon Indonesia 2025: event marathon terbaru, lokasi, tanggal, dan cara pendaftaran di seluruh Indonesia.',
  },

  eventLariIndonesia: {
    primary: 'Event Lari Indonesia',
    secondaries: [
      'jadwal lari 2025',
      'event running indonesia',
      'event lari terbaru',
      'kalender lari',
    ],
    relatedQuestions: [
      'Event lari apa saja tahun 2025?',
      'Jadwal lari terdekat di kota saya?',
      'Event running terbaru Indonesia?',
    ],
    priority: 'high',
    targetPage: '/event',
    description:
      'Jadwal event lari Indonesia 2025: kalender lengkap event running, fun run, marathon, trail run di seluruh Indonesia dengan filter kota.',
  },

  borobudurMarathon: {
    primary: 'Borobudur Marathon',
    secondaries: ['borobudur marathon 2025', 'borobudur marathon jadwal', 'marathon borobudur'],
    relatedQuestions: [
      'Kapan Borobudur Marathon 2025?',
      'Dimana Borobudur Marathon dilangsungkan?',
      'Berapa biaya Borobudur Marathon?',
    ],
    priority: 'medium',
    targetPage: '/event/borobudur-marathon-2025',
    description:
      'Borobudur Marathon 2025: jadwal, lokasi, biaya registrasi, rute, benefit peserta, dan cara mendaftar marathon terbesar di Yogyakarta.',
  },

  jakartaMarathon: {
    primary: 'Jakarta Marathon',
    secondaries: ['jakarta marathon 2025', 'marathon jakarta', 'cgm race'],
    relatedQuestions: [
      'Kapan Jakarta Marathon 2025?',
      'Berapa biaya Jakarta Marathon?',
      'Rute Jakarta Marathon?',
    ],
    priority: 'medium',
    targetPage: '/event/jakarta-marathon-2025',
    description:
      'Jakarta Marathon 2025: jadwal, lokasi, rute, kategori lari, biaya registrasi, benefit, dan cara ikut marathon terbesar di Jakarta.',
  },

  // ========== LOCATION-BASED KEYWORDS ==========
  eventLariBandung: {
    primary: 'Event Lari Bandung',
    secondaries: ['event lari bandung 2025', 'marathon bandung', 'fun run bandung', 'lari bandung'],
    relatedQuestions: [
      'Event lari apa di Bandung 2025?',
      'Jadwal lari terdekat Bandung?',
      'Marathon Bandung kapan?',
    ],
    priority: 'medium',
    targetPage: '/event?province=bandung',
    description:
      'Jadwal event lari Bandung 2025: daftar lengkap marathon, fun run, trail run, dan event running terbaru di Bandung dan sekitarnya.',
  },

  eventLariSurabaya: {
    primary: 'Event Lari Surabaya',
    secondaries: ['event lari surabaya 2025', 'marathon surabaya', 'fun run surabaya'],
    relatedQuestions: [
      'Event lari Surabaya 2025?',
      'Jadwal lari terdekat Surabaya?',
      'Marathon Surabaya kapan?',
    ],
    priority: 'medium',
    targetPage: '/event?province=surabaya',
    description:
      'Jadwal event lari Surabaya 2025: event running terbaru, marathon, fun run, trail run di Surabaya dan sekitarnya dengan filter bulanan.',
  },

  eventLariYogyakarta: {
    primary: 'Event Lari Yogyakarta',
    secondaries: ['event lari yogyakarta 2025', 'marathon yogyakarta', 'lari yogyakarta'],
    relatedQuestions: [
      'Event lari Yogyakarta 2025?',
      'Marathon Yogyakarta kapan?',
      'Jadwal lari di Yogyakarta?',
    ],
    priority: 'medium',
    targetPage: '/event?province=yogyakarta',
    description:
      'Event lari Yogyakarta 2025: jadwal marathon, fun run, trail run di Yogyakarta termasuk Borobudur Marathon dan event terbaru lainnya.',
  },

  // ========== ECOSYSTEM KEYWORDS ==========
  vendorMedaliLari: {
    primary: 'Vendor Medali Lari',
    secondaries: [
      'penjual medali lari',
      'tempat pesan medali lari',
      'medali custom lari',
      'produsen medali',
    ],
    relatedQuestions: [
      'Dimana beli medali lari custom?',
      'Harga medali lari berapa?',
      'Vendor medali terpercaya?',
    ],
    priority: 'medium',
    targetPage: '/ekosistem/vendor-medali',
    description:
      'Vendor medali lari Indonesia: daftar produsen medali custom untuk event lari, harga, kualitas, dan cara memesan medali marathon.',
  },

  raceManagementIndonesia: {
    primary: 'Race Management Indonesia',
    secondaries: [
      'jasa race management lari',
      'event organizer lari',
      'penyelenggara marathon',
      'tim race management',
    ],
    relatedQuestions: [
      'Siapa penyelenggara marathon terpercaya?',
      'Jasa race management untuk event lari?',
      'Event organizer terbaik di Indonesia?',
    ],
    priority: 'medium',
    targetPage: '/ekosistem/race-management',
    description:
      'Jasa race management Indonesia: daftar event organizer profesional untuk penyelenggaraan marathon, fun run, trail run dengan track record terbukti.',
  },

  komunitasLariIndonesia: {
    primary: 'Komunitas Lari Indonesia',
    secondaries: ['komunitas lari', 'running club', 'komunitas pelari', 'join komunitas lari'],
    relatedQuestions: [
      'Komunitas lari apa saja di Indonesia?',
      'Bagaimana bergabung komunitas lari?',
      'Keuntungan bergabung komunitas lari?',
    ],
    priority: 'medium',
    targetPage: '/ekosistem/komunitas-lari',
    description:
      'Komunitas lari Indonesia: daftar running club aktif di berbagai kota, cara bergabung, manfaat komunitas, dan jadwal training bersama.',
  },

  vendorJersey: {
    primary: 'Vendor Jersey Lari',
    secondaries: [
      'custom jersey lari',
      'bikin jersey lari satuan',
      'konveksi jersey running',
      'jersey lari printing',
    ],
    relatedQuestions: [
      'Bahan apa yang bagus untuk jersey lari?',
      'Berapa lama proses pembuatan custom jersey lari?',
      'Apakah bisa memesan jersey lari dengan desain sendiri?',
    ],
    priority: 'medium',
    targetPage: '/ekosistem/vendor-jersey',
    description:
      'Vendor Jersey Lari Indonesia: daftar produsen jersey lari custom untuk event lari, bahan, waktu produksi, dan cara memesan.',
  },

  vendorFotografer: {
    primary: 'Fotografer Event Lari',
    secondaries: [
      'jasa foto event lari',
      'harga fotografer lari',
      'race photography indonesia',
      'foto marathon',
    ],
    relatedQuestions: [
      'Apa saja layanan yang ditawarkan fotografer event lari?',
      'Bagaimana sistem penjualan foto untuk peserta?',
      'Berapa biaya untuk menyewa fotografer untuk event lari?',
    ],
    priority: 'medium',
    targetPage: '/ekosistem/vendor-fotografer',
    description:
      'Fotografer Event Lari Indonesia: daftar fotografer profesional untuk event lari, layanan, harga, dan cara menyewa.',
  },
}

/**
 * Generate SEO title untuk dynamic pages
 * @param keyword - Keyword cluster
 * @param modifier - Optional modifier (e.g., kota, bulan)
 */
export const generateSeoTitle = (keyword: KeywordCluster, modifier?: string): string => {
  if (modifier) {
    return `${keyword.primary} di ${modifier} 2025 - Jadwal & Informasi Lengkap`
  }
  return `${keyword.primary} 2025 Indonesia - Jadwal, Tips & Panduan Lengkap`
}

/**
 * Generate SEO description untuk dynamic pages
 */
export const generateSeoDescription = (keyword: KeywordCluster): string => {
  return keyword.description
}

/**
 * Get related questions untuk FAQ/rich snippet
 */
export const getRelatedQuestions = (keyword: KeywordCluster): string[] => {
  return keyword.relatedQuestions
}

/**
 * Get internal linking suggestions
 */
export const getInternalLinks = (keyword: KeywordCluster): Array<{ text: string; url: string }> => {
  return [
    { text: keyword.primary, url: keyword.targetPage },
    ...keyword.secondaries.slice(0, 3).map(secondary => ({
      text: secondary,
      url: keyword.targetPage,
    })),
  ]
}
