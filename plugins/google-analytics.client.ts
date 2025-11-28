/**
 * Google Analytics Plugin dengan Partytown
 * 
 * Menggunakan @nuxt/scripts untuk load Google Analytics di web worker
 * untuk performa yang lebih baik (tidak blocking main thread)
 * 
 * Partytown memindahkan gtag.js ke web worker sehingga tidak menghambat
 * main thread dan meningkatkan Core Web Vitals (INP, LCP)
 */

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const gaId = config.public.googleAnalyticsId

  // Skip jika GA ID tidak dikonfigurasi
  if (!gaId) {
    return
  }

  // Load Google Analytics dengan Partytown (web worker)
  // Partytown akan otomatis memindahkan script ke web worker
  // karena sudah dikonfigurasi di nuxt.config.ts (partytown.forward: ['gtag'])
  useScriptGoogleAnalytics({
    id: gaId,
    // Script akan otomatis di-load di client dan di-forward ke Partytown worker
  })

  // gtag akan otomatis di-forward ke Partytown worker
  // Page view tracking akan otomatis dilakukan oleh gtag config
  // Untuk custom events di komponen lain, gunakan:
  // const { proxy } = useScriptGoogleAnalytics()
  // proxy.gtag('event', 'event_name', {...})
})

