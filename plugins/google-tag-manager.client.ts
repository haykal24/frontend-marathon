/**
 * Google Tag Manager Plugin dengan Partytown
 * 
 * Menggunakan @nuxt/scripts untuk load Google Tag Manager di web worker
 * untuk performa yang lebih baik (tidak blocking main thread)
 * 
 * Partytown memindahkan GTM script ke web worker sehingga tidak menghambat
 * main thread dan meningkatkan Core Web Vitals (INP, LCP)
 */

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const gtmId = config.public.googleTagManagerId

  // Skip jika GTM ID tidak dikonfigurasi
  if (!gtmId) {
    return
  }

  // Initialize dataLayer jika belum ada
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    })
  }

  // Load Google Tag Manager script di head menggunakan useHead
  // Partytown akan otomatis memindahkan script ke web worker
  // karena sudah dikonfigurasi di nuxt.config.ts (partytown.forward: ['dataLayer.push', 'gtm'])
  useHead({
    script: [
      {
        innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
        type: 'text/javascript',
        // Partytown akan otomatis intercept script ini
      },
    ],
  })
})

