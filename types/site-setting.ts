export interface SiteSettingValue {
  key: string
  label: string
  value: string | number | boolean | Record<string, unknown> | null
  type: 'text' | 'textarea' | 'image' | 'json' | 'url' | 'email' | 'phone'
  group: string
  group_label: string
  description?: string | null
}

export type SiteSettingResponse = Record<string, SiteSettingValue>
