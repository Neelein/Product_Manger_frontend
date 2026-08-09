import { apiFetch } from '../../../shared/api/client'
import type { CreateInventoryItemRequest, CreateInventoryRequest, InventoryItemListResponse, InventoryItemResponse, InventoryListResponse, InventoryResponse, UpdateInventoryItemRequest, UpdateInventoryRequest } from "../types"
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
