export interface BioLink {
  id: number
  title: string
  subtitle?: string | null
  url: string
  image?: string | null
  image_original?: string | null
  order: number
}

export interface BioLinkResponse {
  success: boolean
  message: string
  data: BioLink[]
}

