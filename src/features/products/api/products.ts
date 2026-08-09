import { apiFetch } from '../../../shared/api/client'
import type { CreateProductRequest, ProductListResponse, ProductResponse, UpdateProductRequest } from "../types"
export function listProducts(): Promise<ProductListResponse> {
  return apiFetch<ProductListResponse>('/api/products')
}

export function getProduct(id: string): Promise<ProductResponse> {
  return apiFetch<ProductResponse>(`/api/products/${id}`)
}

export function createProduct(data: CreateProductRequest): Promise<ProductResponse> {
  return apiFetch<ProductResponse>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProduct(id: string, data: UpdateProductRequest): Promise<ProductResponse> {
  return apiFetch<ProductResponse>(`/api/products/${id}/update`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteProduct(id: string): Promise<void> {
  return apiFetch<void>(`/api/products/${id}/delete`, { method: 'POST' })
}
