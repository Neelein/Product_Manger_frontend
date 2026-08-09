import { apiFetch } from '../../../shared/api/client'
import type { CreateProductVariantRequest, ProductVariantListResponse, ProductVariantResponse, UpdateProductVariantRequest } from "../types"
export function listVariants(productId: string): Promise<ProductVariantListResponse> {
  return apiFetch<ProductVariantListResponse>(`/api/products/${productId}/detail/variants`)
}

export function createVariant(productId: string, data: CreateProductVariantRequest): Promise<ProductVariantResponse> {
  return apiFetch<ProductVariantResponse>(`/api/products/${productId}/detail/variants`, { method: 'POST', body: JSON.stringify(data) })
}

export function getVariant(productId: string, variantId: string): Promise<ProductVariantResponse> {
  return apiFetch<ProductVariantResponse>(`/api/products/${productId}/detail/variants/${variantId}`)
}

export function updateVariant(productId: string, variantId: string, data: UpdateProductVariantRequest): Promise<ProductVariantResponse> {
  return apiFetch<ProductVariantResponse>(`/api/products/${productId}/detail/variants/${variantId}/update`, { method: 'POST', body: JSON.stringify(data) })
}

export function deleteVariant(productId: string, variantId: string): Promise<void> {
  return apiFetch<void>(`/api/products/${productId}/detail/variants/${variantId}/delete`, { method: 'POST' })
}
