export interface RatePackage {
  id: number
  name: string
  slug: string
  category: string | null
  category_slug?: string | null
  category_label: string | null
  category_description?: string | null
  category_order?: number | null
  placement_key: string | null
  placement_label: string | null
  placement_description?: string | null
  placement_slot_key?: string | null
  description: string | null
  price: number | null
  price_display: string | null
  price_formatted: string | null
  duration: string | null
  audience: string | null
  deliverables: string[]
  channels: string[]
  cta_label: string | null
  cta_url: string | null
  is_active: boolean
  order_column: number
  created_at: string | null
  updated_at: string | null
}
