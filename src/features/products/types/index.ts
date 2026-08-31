export interface Product {
  id: string
  name: string
  status: string
  category_id: string
  category: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateProductRequest {
  name: string
  status: string
  category_id: string
}

export type UpdateProductRequest = CreateProductRequest

export interface ProductResponse {
  product: Product
}

export interface ProductListResponse {
  products: Product[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  filename: string
  created_at: string
}

export interface ProductImageListResponse {
  images: ProductImage[]
}

export interface ProductDetail {
  id: string
  product_id: string
  introduction: string
  usage_instructions: string
  return_policy: string
  created_at: string
  updated_at: string
}

export type ProductDetailModel = ProductDetail

export interface CreateDetailRequest {
  introduction: string
  usage_instructions: string
  return_policy: string
}

export interface DetailResponse {
  detail: ProductDetail
}

export interface ProductPrice {
  id: string
  product_detail_id: string
  product_variant_id: string | null
  label: string
  amount: number
  currency: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ProductOption {
  id: string
  product_detail_id: string
  name: string
  value: string
  created_at: string
  updated_at: string
}

export interface CreateProductOptionRequest {
  name: string
  value: string
}

export type UpdateProductOptionRequest = CreateProductOptionRequest

export interface ProductOptionResponse {
  option: ProductOption
}

export interface ProductOptionListResponse {
  options: ProductOption[]
}

export interface ProductVariant {
  id: string
  product_detail_id: string
  product_price_id: string
  sku: string | null
  status: string
  option_ids: string[]
  created_at: string
  updated_at: string
}

export interface CreateProductVariantRequest {
  product_price_id: string
  sku?: string | null
  status: string
  option_ids: string[]
}

export type UpdateProductVariantRequest = CreateProductVariantRequest

export interface ProductVariantResponse {
  variant: ProductVariant
}

export interface ProductVariantListResponse {
  variants: ProductVariant[]
}

export interface CreatePriceRequest {
  label: string
  amount: number
  currency?: string
  sort_order?: number
}

export interface PriceResponse {
  price: ProductPrice
}

export interface PriceListResponse {
  prices: ProductPrice[]
}

export type UpdateDetailRequest = CreateDetailRequest

export type UpdatePriceRequest = CreatePriceRequest
