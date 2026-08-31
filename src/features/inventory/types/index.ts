// ── Inventory ──

export interface Inventory {
  id: string
  product_variant_id: string
  product_detail_id: string
  product_id: string
  name: string
  variant_name: string
  total_quantity: number
  sold_quantity: number
  status: string
  created_at: string
  updated_at: string
}

export interface CreateInventoryRequest {
  product_variant_id: string
  status?: string
}

export interface UpdateInventoryRequest {
  status?: string
}

export interface InventoryResponse {
  inventory: Inventory
}

export interface InventoryListResponse {
  inventories: Inventory[]
}

export interface InventoryItem {
  id: string
  inventory_id: string
  item_code: string
  status: string
  cost: number | null
  date_added: string
  status_updated_at: string
  created_at: string
  updated_at: string
}

export interface CreateInventoryItemRequest {
  item_code: string
  status?: string
  cost?: number
  date_added?: string
}

export interface UpdateInventoryItemRequest {
  item_code: string
  status?: string
  cost?: number
  date_added?: string
}

export interface InventoryItemResponse {
  item: InventoryItem
}

export interface InventoryItemListResponse {
  items: InventoryItem[]
}
