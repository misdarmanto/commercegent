export interface ICreateProductPublicRequest {
  code: string
  barcode: string
  name: string
  stock: number
  price: number
  weight: number
  unit: string
  isVisible: boolean
}

export interface IUpdateProductPublicRequest {
  code: string
  barcode?: string
  name?: string
  stock?: number
  price?: number
  weight?: number
  unit?: string
  isVisible?: boolean
}
