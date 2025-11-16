/**
 * Centralized API Configuration
 * Menggunakan runtime config dari Nuxt yang membaca dari environment variables
 */
export const useApiConfig = () => {
  const config = useRuntimeConfig()

  return {
    baseUrl: config.public.apiBase,
    siteUrl: config.public.siteUrl,
    appName: config.public.appName,
  }
}
