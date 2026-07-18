import { apiFetch } from './client'
import type { CreateDetailRequest, CreateInventoryItemRequest, CreateInventoryRequest, CreatePriceRequest, CreateProductRequest, DetailResponse, InventoryItemListResponse, InventoryItemResponse, InventoryListResponse, InventoryResponse, PriceListResponse, PriceResponse, ProductListResponse, ProductResponse, UpdateDetailRequest, UpdateInventoryItemRequest, UpdateInventoryRequest, UpdatePriceRequest, UpdateProductRequest } from '../types'

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

// ── Inventory ──

export function listInventories(): Promise<InventoryListResponse> {
  return apiFetch<InventoryListResponse>('/api/inventories')
}

export function getInventory(id: string): Promise<InventoryResponse> {
  return apiFetch<InventoryResponse>(`/api/inventories/${id}`)
}

export function createInventory(data: CreateInventoryRequest): Promise<InventoryResponse> {
  return apiFetch<InventoryResponse>('/api/inventories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateInventory(id: string, data: UpdateInventoryRequest): Promise<InventoryResponse> {
  return apiFetch<InventoryResponse>(`/api/inventories/${id}/update`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteInventory(id: string): Promise<void> {
  return apiFetch<void>(`/api/inventories/${id}/delete`, { method: 'POST' })
}

export function listItems(inventoryId: string): Promise<InventoryItemListResponse> {
  return apiFetch<InventoryItemListResponse>(`/api/inventories/${inventoryId}/items`)
}

export function getItem(inventoryId: string, itemId: string): Promise<InventoryItemResponse> {
  return apiFetch<InventoryItemResponse>(`/api/inventories/${inventoryId}/items/${itemId}`)
}

export function createItem(inventoryId: string, data: CreateInventoryItemRequest): Promise<InventoryItemResponse> {
  return apiFetch<InventoryItemResponse>(`/api/inventories/${inventoryId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateItem(inventoryId: string, itemId: string, data: UpdateInventoryItemRequest): Promise<InventoryItemResponse> {
  return apiFetch<InventoryItemResponse>(`/api/inventories/${inventoryId}/items/${itemId}/update`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteItem(inventoryId: string, itemId: string): Promise<void> {
  return apiFetch<void>(`/api/inventories/${inventoryId}/items/${itemId}/delete`, { method: 'POST' })
}
