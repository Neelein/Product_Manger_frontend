import { apiFetch } from '../../../shared/api/client'
import type { CreateProductOptionRequest, ProductOptionListResponse, ProductOptionResponse, UpdateProductOptionRequest } from "../types"
// ── Product options and variants ──

export function listOptions(productId: string): Promise<ProductOptionListResponse> {
  return apiFetch<ProductOptionListResponse>(`/api/products/${productId}/detail/options`)
}

export function createOption(productId: string, data: CreateProductOptionRequest): Promise<ProductOptionResponse> {
  return apiFetch<ProductOptionResponse>(`/api/products/${productId}/detail/options`, { method: 'POST', body: JSON.stringify(data) })
}

export function getOption(productId: string, optionId: string): Promise<ProductOptionResponse> {
  return apiFetch<ProductOptionResponse>(`/api/products/${productId}/detail/options/${optionId}`)
}

export function updateOption(productId: string, optionId: string, data: UpdateProductOptionRequest): Promise<ProductOptionResponse> {
  return apiFetch<ProductOptionResponse>(`/api/products/${productId}/detail/options/${optionId}/update`, { method: 'POST', body: JSON.stringify(data) })
}

export function deleteOption(productId: string, optionId: string): Promise<void> {
  return apiFetch<void>(`/api/products/${productId}/detail/options/${optionId}/delete`, { method: 'POST' })
}
