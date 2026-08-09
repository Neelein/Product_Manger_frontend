import { apiFetch } from '../../../shared/api/client'
import type { CreatePriceRequest, PriceListResponse, PriceResponse, UpdatePriceRequest } from "../types"
export function listPrices(productId: string): Promise<PriceListResponse> {
  return apiFetch<PriceListResponse>(`/api/products/${productId}/detail/prices`)
}

export function createPrice(productId: string, detailId: string, data: CreatePriceRequest): Promise<PriceResponse> {
  return apiFetch<PriceResponse>(`/api/products/${productId}/details/${detailId}/prices`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updatePrice(productId: string, priceId: string, data: UpdatePriceRequest): Promise<PriceResponse> {
  return apiFetch<PriceResponse>(`/api/products/${productId}/detail/prices/${priceId}/update`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
