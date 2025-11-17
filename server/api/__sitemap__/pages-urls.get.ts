/**
 * Pages sitemap URLs
 * Mengembalikan hanya URL dengan _sitemap = 'pages'
 */
export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:8000/api/v1'
  const apiUrl = `${apiBase}/sitemap`
  
  try {
    const urls = await $fetch(apiUrl, {
      timeout: 15000,
      retry: 1,
    })
    
    if (!Array.isArray(urls)) {
      return []
    }
    
    // Filter hanya pages
    return urls.filter((url: { _sitemap?: string }) => url._sitemap === 'pages')
  } catch {
    return []
  }
})

