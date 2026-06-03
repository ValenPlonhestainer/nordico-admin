export interface ColorVariant {
  name: string
  color: string
  images: string[]
}

export interface Product {
  key: string
  name: string
  price_unit: number
  tag: string | null
  order: number
  images?: string[] | null
  variants?: ColorVariant[] | null
}

export interface Service {
  id: string
  label: string
  price: number
  type: 'unit' | 'fixed'
  price_label: string
}
