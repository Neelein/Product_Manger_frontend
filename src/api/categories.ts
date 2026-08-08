import { apiFetch } from './client'
import type {
  CategoryListResponse,
  CategoryResponse,
  CreateCategoryRequest,
} from '../types'

export function listCategories(): Promise<CategoryListResponse> {
  return apiFetch<CategoryListResponse>('/api/categories')
}

export function createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
  return apiFetch<CategoryResponse>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateCategory(id: string, data: CreateCategoryRequest): Promise<CategoryResponse> {
  return apiFetch<CategoryResponse>(`/api/categories/${id}/update`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteCategory(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/categories/${id}/delete`, {
    method: 'POST',
  })
}
