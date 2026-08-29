import { apiFetch, uploadFormDataWithProgress } from '../../../shared/api/client.ts'
import type { CreateProductRequest, ProductImageListResponse, ProductListResponse, ProductResponse, UpdateProductRequest } from '../types/index.ts'
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

export function listProductImages(id: string): Promise<ProductImageListResponse> {
  return apiFetch<ProductImageListResponse>(`/api/products/${id}/images`)
}

export function uploadProductImages(id: string, files: File[], onProgress?: (percent: number) => void): Promise<ProductImageListResponse> {
  const formData = new FormData()
  files.forEach(file => formData.append('images', file))
  return uploadFormDataWithProgress<ProductImageListResponse>(`/api/products/${id}/images`, formData, onProgress)
}
