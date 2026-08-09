import { apiFetch } from '../../../shared/api/client'
import type { CreateDetailRequest, DetailResponse, UpdateDetailRequest } from "../types"
export function getDetail(productId: string): Promise<DetailResponse> {
  return apiFetch<DetailResponse>(`/api/products/${productId}/detail`)
}

export function createDetail(productId: string, data: CreateDetailRequest): Promise<DetailResponse> {
  return apiFetch<DetailResponse>(`/api/products/${productId}/details`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateDetail(productId: string, data: UpdateDetailRequest): Promise<DetailResponse> {
  return apiFetch<DetailResponse>(`/api/products/${productId}/detail/update`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
