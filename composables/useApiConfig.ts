export const useApiConfig = () => {
  // useRuntimeConfig is auto-imported by Nuxt
  const config = useRuntimeConfig()

  return {
    baseUrl: config.public.apiBase as string,
    siteUrl: config.public.siteUrl as string,
    appName: config.public.appName as string,
  }
}
